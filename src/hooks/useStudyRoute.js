import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { buildRoute, thresholdGap, computeDebt, distributeDebt, debtInWeeks } from "../lib/routeEngine";
import { usePlanContext } from "./usePlanContext";
import { useExam } from "../contexts/ExamContext";
import { getSubjectsForExam } from "../data/curriculum";
import { selectTrials } from "../store/slices/trialSlice";
import { selectGoals } from "../store/slices/goalsSlice";
import { startOfWeekTR } from "../lib/dateUtils";
import { useAuth } from "../contexts/AuthContext";
import { usePremium } from "../contexts/PremiumContext";
import { ensureSingleActiveRouteStop } from "../domain/route/stopStatus";
import { saveRouteWeeks, getRouteWeeks, getRouteState, getLatestRouteStops, pauseRoute, resumeRoute, transitionRouteStop } from "../supabase/routePlan";
import * as Crypto from "expo-crypto";
import { track } from "../lib/analytics";
import { EVENTS } from "../constants/analytics";
import { weightedWeakAreas } from "../lib/buildPlanContext";
import { forecastNet } from "../lib/netForecast";
import { buildTempoScenarios } from "../domain/forecast/tempoScenario";
import { routeReadinessSummary } from "../domain/route/routeCreation";

function trialTypesForRoute(examType, field) {
  if (examType === "lgs") return ["LGS"];
  if (examType !== "tyt_ayt") return ["TYT"];
  const ayt = field === "sayisal" ? "AYT_SAY"
    : field === "ea" ? "AYT_EA" : field === "sozel" ? "AYT_SOZ" : null;
  return ayt ? ["TYT", ayt, "AYT"] : ["TYT"];
}

function forecastProfilesForRoute(examType, field) {
  if (examType === "lgs") return [{ types: ["LGS"], max: 90 }];
  if (examType !== "tyt_ayt") return [{ types: ["TYT"], max: 120 }];
  const ayt = field === "sayisal" ? "AYT_SAY"
    : field === "ea" ? "AYT_EA" : field === "sozel" ? "AYT_SOZ" : "AYT_SAY";
  return [{ types: ["TYT"], max: 120 }, { types: [ayt, "AYT"], max: 80 }];
}

/**
 * Kişiye özel rota — ekranların tek giriş noktası.
 *
 * ADLANDIRMA: `useRoute` DEĞİL. React Navigation'ın `useRoute`'u 15+ ekranda
 * kullanılıyor; aynı adı vermek yanlış import'a davetiye çıkarıyordu.
 *
 * TASARIM NOTU (AKIŞ 2 · ROTA DERİNLİĞİ):
 *   Rota Detay        → route.weeks[0]
 *   Rotanın tamamı    → route.weeks
 *   Durak Detayı      → route.weeks[i].stops[j]   (cost, difficulty, score içerir)
 *   Ara Verme         → pausedWeeks parametresi (kapasite kademeli döner)
 *   Senaryolar        → scenario(soruSayisi)
 *   Bölüm Eşiği       → threshold(currentNet, targetNet)
 *   Rotayı Yeniden Çiz → bağımlılıklar değişince zaten yeniden hesaplanıyor
 *
 * TASARIM NOTU (AKIŞ 7):
 *   Konu Borcu        → debt.items
 *   Borç Dağıtıldı    → debtPlan.weeks
 *   Plan vs Gerçek    → debt.items[i].completion
 */
export function useStudyRoute({ pausedWeeks = null, persist = true } = {}) {
  const { examType, field, examDate } = useExam();
  const { user } = useAuth();
  const { accessError, accessLoading, checkFeature, refreshUsage } = usePremium();
  const hasRouteAccess = !accessLoading && checkFeature("detailed_roadmap");
  const [pastWeeks, setPastWeeks] = useState([]);
  const [routeState, setRouteStateLocal] = useState(null);
  const [routeCreating, setRouteCreating] = useState(false);
  const [routeCreationError, setRouteCreationError] = useState(null);
  const isPaused = !!routeState?.paused_at && (!routeState?.resumed_at
    || new Date(routeState.paused_at) > new Date(routeState.resumed_at));
  const recoveryWeek = useMemo(() => {
    if (pausedWeeks != null) return pausedWeeks;
    if (!routeState?.paused_at || !routeState?.resumed_at || isPaused) return null;
    const pauseWeeks = (new Date(routeState.resumed_at) - new Date(routeState.paused_at)) / 604800000;
    if (pauseWeeks < 1) return null;
    return Math.max(0, Math.floor((Date.now() - new Date(routeState.resumed_at)) / 604800000));
  }, [isPaused, pausedWeeks, routeState?.paused_at, routeState?.resumed_at]);
  const [persistedStops, setPersistedStops] = useState([]);
  const { dataHealth, weekLogs, topicRows } = usePlanContext();
  const trials = useSelector(selectTrials);
  const goals = useSelector(selectGoals);
  const allowedTrialTypes = useMemo(
    () => trialTypesForRoute(examType, field), [examType, field],
  );

  const daysLeft = useMemo(() => {
    if (!examDate) return null;
    const ms = new Date(examDate) - new Date();
    return Math.max(0, Math.ceil(ms / 86400000));
  }, [examDate]);

  // topic_progress satırlarını { ders: { konu: {...} } } şekline indir.
  const progressByKey = useMemo(() => {
    const map = {};
    for (const row of topicRows || []) {
      const subject = row.subject_key || row.subject;
      const topic = row.topic_name || row.topic;
      if (!subject || !topic) continue;
      if (!map[subject]) map[subject] = {};
      map[subject][topic] = row;
    }
    return map;
  }, [topicRows]);

  // Son denemelerde zayıf kalan dersler — önceliğe girdi.
  const weakSubjectKeys = useMemo(() => {
    const recent = (trials || [])
      .filter((trial) => allowedTrialTypes.includes(trial.trialType)).slice(0, 5);
    if (!recent.length) return [];
    return Object.entries(weightedWeakAreas(recent))
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([key]) => key);
  }, [allowedTrialTypes, trials]);

  const computedRoute = useMemo(() => buildRoute({
    // examType yoksa rota HESAPLANMAZ. "tyt" varsaymak LGS kullanıcısının
    // rotasını yanlış müfredatla çizerdi.
    pool: examType && hasRouteAccess ? getSubjectsForExam(examType, field) : [],
    progressByKey,
    studyLogs: weekLogs || [],
    dailyQuestionGoal: goals?.dailyQuestions || 20,
    daysLeft,
    weakSubjectKeys,
    pausedWeeks: recoveryWeek,
    examType,
    studyLogDataState: dataHealth?.logs,
  }), [dataHealth?.logs, examType, field, hasRouteAccess, progressByKey, weekLogs,
    goals?.dailyQuestions, daysLeft, weakSubjectKeys, recoveryWeek]);

  const route = useMemo(() => {
    const byKey = new Map((persistedStops || []).map((stop) => [stop.logical_key, stop]));
    return {
      ...computedRoute,
      weeks: ensureSingleActiveRouteStop(computedRoute.weeks.map((week) => ({
        ...week,
        stops: week.stops.map((stop) => {
          const saved = byKey.get(stop.logicalStopKey);
          return saved ? {
            ...stop,
            stopId: saved.id,
            lifecycleStatus: saved.lifecycle_status,
            version: saved.version,
            insight: saved.metadata?.insight || stop.insight,
          } : stop;
        }),
      }))),
    };
  }, [computedRoute, persistedStops]);

  const forecastProfile = useMemo(() => forecastProfilesForRoute(examType, field)
    .map((profile) => ({
      ...profile,
      count: (trials || []).filter((trial) => profile.types.includes(trial.trialType)).length,
    }))
    .sort((a, b) => b.count - a.count)[0], [examType, field, trials]);
  const forecastTrials = useMemo(
    () => (trials || []).filter((trial) => forecastProfile?.types.includes(trial.trialType)),
    [forecastProfile?.types, trials],
  );
  const forecastMax = forecastProfile?.max ?? 120;
  const forecast = useMemo(() => forecastNet(
    forecastTrials, examDate, forecastMax, forecastProfile?.types,
  ), [examDate, forecastMax, forecastTrials, forecastProfile?.types]);
  const tempoScenarios = useMemo(() => buildTempoScenarios({
    forecast,
    questionsPerWeek: route.capacity?.questionsPerWeek,
    stopsPerWeek: route.currentWeek?.stops?.length || route.weeks?.[0]?.stops?.length || 0,
    trials: forecastTrials,
    studyLogs: weekLogs,
    examDate,
    maxNet: forecastMax,
  }), [examDate, forecast, forecastMax, forecastTrials,
    route.capacity?.questionsPerWeek, route.weeks, weekLogs]);
  const scenario = useCallback(
    (multiplier = 1) => tempoScenarios.find((item) => item.multiplier === multiplier) || null,
    [tempoScenarios],
  );
  const routeCreated = persistedStops.length > 0;
  const routeReadiness = useMemo(() => routeReadinessSummary({
    weeks: route.weeks,
    intelligence: route.intelligence,
    daysLeft,
    forecast,
    tempoScenarios,
    dataHealth,
  }), [dataHealth, daysLeft, forecast, route.intelligence, route.weeks, tempoScenarios]);

  // Eşik hesabı artık müfredat havuzunu ve ilerlemeyi de alıyor —
  // net kazancı derse göre değişiyor.
  const threshold = useMemo(
    () => (currentNet, targetNet) => thresholdGap({
      currentNet,
      targetNet,
      route,
      pool: examType ? getSubjectsForExam(examType, field) : [],
      progressByKey,
      trialType: examType === "lgs" ? "LGS" : undefined,
    }),
    [route, examType, field, progressByKey],
  );

  // Geçmiş planı sunucudan çek — borcun "planlanan" tarafı.
  // examType filtresi kritik: kullanıcı YKS↔LGS geçtiyse eski müfredatın
  // planı borç sayılmamalı.
  useEffect(() => {
    if (!user?.id || !examType || !hasRouteAccess) return;
    let cancelled = false;
    getRouteWeeks(user.id, { examType })
      .then((rows) => { if (!cancelled) setPastWeeks(rows); })
      .catch(() => {});
    getRouteState(user.id)
      .then((st) => { if (!cancelled) setRouteStateLocal(st); })
      .catch(() => {});
    getLatestRouteStops(user.id, examType)
      .then((rows) => { if (!cancelled) setPersistedStops(rows); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id, examType, hasRouteAccess]);

  // Rota çizildiğinde haftaları sakla. Bu olmadan borç her zaman sıfır çıkar.
  useEffect(() => {
    if (!persist || !user?.id || !examType || !hasRouteAccess || isPaused) return;
    if (!computedRoute.weeks?.length) return;
    saveRouteWeeks(user.id, computedRoute.weeks, examType, computedRoute.revision)
      .then(() => getLatestRouteStops(user.id, examType))
      .then(setPersistedStops)
      .catch(() => {});
  }, [persist, user?.id, examType, hasRouteAccess, isPaused,
    computedRoute.weeks, computedRoute.revision]);

  const createRoute = useCallback(async () => {
    if (!user?.id || !examType || !hasRouteAccess) {
      throw new Error("route_access_unavailable");
    }
    if (!computedRoute.weeks?.length) {
      throw new Error("route_preview_unavailable");
    }
    setRouteCreating(true);
    setRouteCreationError(null);
    try {
      const savedWeekCount = await saveRouteWeeks(
        user.id,
        computedRoute.weeks,
        examType,
        computedRoute.revision,
      );
      if (savedWeekCount <= 0) {
        throw new Error("route_persist_failed");
      }
      const [stops, rows] = await Promise.all([
        getLatestRouteStops(user.id, examType),
        getRouteWeeks(user.id, { examType }),
      ]);
      setPersistedStops(stops);
      setPastWeeks(rows);
      track(EVENTS.ROUTE_CREATED, {
        examType,
        confidence: computedRoute.intelligence?.confidence || "low",
        weeks: computedRoute.weeks.length,
      });
      return { stops, weeks: rows };
    } catch (e) {
      setRouteCreationError("Rota oluşturulamadı. Bağlantını kontrol edip tekrar dene.");
      track(EVENTS.ROUTE_CREATION_FAILED, { examType });
      throw e;
    } finally {
      setRouteCreating(false);
    }
  }, [computedRoute.intelligence?.confidence, computedRoute.revision,
    computedRoute.weeks, examType, hasRouteAccess, user?.id]);

  // Borç: geçmiş haftaların planı ile gerçekleşeni karşılaştır.
  const debt = useMemo(() => {
    const actualByWeek = {};
    for (const log of weekLogs || []) {
      const raw = log.study_date || log.studyDate;
      if (!raw) continue;
      const wk = startOfWeekTR(new Date(raw));
      if (!actualByWeek[wk]) actualByWeek[wk] = { questions: 0 };
      actualByWeek[wk].questions += Number(log.question_count ?? log.questionCount ?? 0) || 0;
    }
    const thisWeek = startOfWeekTR(new Date());
    // Sadece BİTMİŞ haftalar borç üretir; içinde bulunulan hafta henüz açık.
    const finished = pastWeeks.filter((w) => w.weekStart < thisWeek);
    return computeDebt(finished, actualByWeek);
  }, [weekLogs, pastWeeks]);

  const pause = useCallback(async () => {
    if (!user?.id) return;
    const next = await pauseRoute(user.id);
    if (next) setRouteStateLocal(next);
  }, [user?.id]);

  const resume = useCallback(async () => {
    if (!user?.id) return;
    const next = await resumeRoute(user.id);
    if (next) setRouteStateLocal(next);
  }, [user?.id]);

  const transitionStop = useCallback(async (stop, transition, payload = {}) => {
    if (!stop?.stopId) throw new Error("route_stop_not_persisted");
    const updated = await transitionRouteStop({
      stopId: stop.stopId,
      transition,
      expectedVersion: stop.version ?? 1,
      clientOperationId: Crypto.randomUUID(),
      payload,
    });
    if (updated) {
      setPersistedStops((current) => current.map((item) => (
        item.id === updated.id ? updated : item
      )));
      track(EVENTS.ROUTE_STOP_TRANSITIONED, {
        transition,
        subject: updated.subject,
        source: payload.source || "unknown",
      });
    }
    return updated;
  }, []);

  return {
    route,
    capacity: route.capacity,
    weeks: route.weeks,
    currentWeek: route.weeks[0] || null,
    feasible: route.feasible,
    shortfall: route.shortfall,
    totals: route.totals,
    intelligence: route.intelligence,
    daysLeft,
    scenario,
    tempoScenarios,
    forecast,
    hasRouteAccess,
    routeAccessError: accessError,
    routeAccessLoading: accessLoading,
    refreshRouteAccess: refreshUsage,
    routeCreated,
    routeReadiness,
    routeCreating,
    routeCreationError,
    createRoute,
    threshold,
    debt,
    debtWeeks: debtInWeeks(debt.totalQuestions, route.capacity),
    // Ara verme / dondurma — tasarım AKIŞ 2.
    isPaused,
    pause,
    resume,
    transitionStop,
    distributeDebt: (weeks) => distributeDebt(debt.totalQuestions, weeks || route.weeks, route.capacity),
  };
}
