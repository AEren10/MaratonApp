import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { buildRoute, thresholdGap, distributeDebt } from "../lib/routeEngine";
import { usePlanContext } from "./usePlanContext";
import { useExam } from "../contexts/ExamContext";
import { getSubjectsForExam, TYT_DERSLER } from "../data/curriculum";
import { selectTrials } from "../store/slices/trialSlice";
import { selectGoals } from "../store/slices/goalsSlice";
import { startOfWeekTR } from "../lib/dateUtils";
import { useAuth } from "../contexts/AuthContext";
import { usePremium } from "../contexts/PremiumContext";
import { ensureSingleActiveRouteStop } from "../domain/route/stopStatus";
import { saveRouteWeeks, getRouteWeeks, getRouteState, getLatestRouteStops, pauseRoute, resumeRoute } from "../supabase/routePlan";
import { saveRouteStopTransitionOffline } from "../lib/offlineQueue";
import { persistRouteOnce } from "../lib/routePersistOnce";
import * as Crypto from "expo-crypto";
import { track } from "../lib/analytics";
import { EVENTS } from "../constants/analytics";
import { weightedWeakAreas } from "../lib/buildPlanContext";
import { subjectWeaknessFactors } from "../domain/route/trialWeakness";
import { forecastNet } from "../lib/netForecast";
import { buildTempoScenarios } from "../domain/forecast/tempoScenario";
import { routeReadinessSummary } from "../domain/route/routeCreation";
import { summarizeRouteRevision } from "../domain/route/routeRevisionSummary";
import { routePersistenceDecision } from "../domain/route/routePersistenceDecision";
import { isRoutePausedForExam, routePausedAtForExam } from "../domain/route/routePauseState";
import { captureError } from "../lib/errorReporting";
import { PREMIUM_ENABLED } from "../constants/premium";
import * as appStorage from "../lib/storage/appStorage";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { onRouteUpdated, emitRouteUpdated } from "../lib/routeEvents";
import { makeRouteStopRootKey } from "../domain/route/routeIdentity";
import { overdueStops } from "../domain/route/overdueStops";
import { useRouteWrongSignal } from "./useRouteWrongSignal";
import { topicFeelFromLogs } from "../domain/route/topicFeel";
import { habitWeeklyLoad } from "../domain/route/habits";
import { useRouteHabits } from "./useRouteHabits";
import { useClassSchedule } from "./useClassSchedule";
import { studyWeekdays } from "../domain/program/classSchedule";
import { useForecastTarget } from "./useForecastTarget";
import { weekdayRhythm } from "../domain/program/weekdayRhythm";
import { setWeekdayRhythm } from "../lib/weekdayRhythmStore";
import { dateKey as toDateKey } from "../lib/dateUtils";

const MIN_PER_QUESTION = 1.5;

let _lastRouteCache = {
  key: "",
  result: null,
};

function cachedBuildRoute(inputs, key) {
  if (_lastRouteCache.result && _lastRouteCache.key === key) {
    return _lastRouteCache.result;
  }
  const result = buildRoute(inputs);
  _lastRouteCache = { key, result };
  return result;
}

function trialTypesForRoute(examType, field) {
  if (examType === "lgs") return ["LGS"];
  if (examType === "dil") return ["TYT", "YDT"];
  if (examType !== "tyt_ayt") return ["TYT"];
  const ayt = field === "sayisal" ? "AYT_SAY"
    : field === "ea" ? "AYT_EA" : field === "sozel" ? "AYT_SOZ" : null;
  return ayt ? ["TYT", ayt, "AYT"] : ["TYT"];
}

const TYT_KEYS = new Set(TYT_DERSLER.map((s) => s.key));
function examPool(pool, types = []) {
  if (!types?.length || types.includes("LGS")) return pool;
  const tyt = types.includes("TYT");
  return pool.filter((s) => TYT_KEYS.has(s.key) === tyt);
}

function latestNetOf(trials = []) {
  const latest = [...trials]
    .map((t, index) => ({ trial: t, orderIndex: index }))
    .sort((a, b) => {
      const dateA = String(a.trial?.date || a.trial?.trial_date || "");
      const dateB = String(b.trial?.date || b.trial?.trial_date || "");
      const dateCmp = dateB.localeCompare(dateA);
      if (dateCmp !== 0) return dateCmp;
      const timeA = a.trial?.created_at || a.trial?.createdAt ? new Date(a.trial.created_at || a.trial.createdAt).getTime() : (Number(a.trial?.id) > 1e9 ? Number(a.trial.id) : 0);
      const timeB = b.trial?.created_at || b.trial?.createdAt ? new Date(b.trial.created_at || b.trial.createdAt).getTime() : (Number(b.trial?.id) > 1e9 ? Number(b.trial.id) : 0);
      // En yeni once: ayni gunde SONRA girilen deneme basa gelir.
      if (timeA !== timeB) return timeB - timeA;
      return a.orderIndex - b.orderIndex;
    })[0]?.trial || null;
  // Tahminle ayni olcek: normalize net (varsa).
  const net = Number(latest?.normalizedTotalNet ?? latest?.totalNet ?? latest?.total_net);
  return Number.isFinite(net) ? net : null;
}

function forecastProfilesForRoute(examType, field) {
  if (examType === "lgs") return [{ types: ["LGS"], max: 90 }];
  if (examType === "dil") return [{ types: ["TYT"], max: 120 }, { types: ["YDT"], max: 80 }];
  if (examType !== "tyt_ayt") return [{ types: ["TYT"], max: 120 }];
  const ayt = field === "sayisal" ? "AYT_SAY"
    : field === "ea" ? "AYT_EA" : field === "sozel" ? "AYT_SOZ" : "AYT_SAY";
  return [{ types: ["TYT"], max: 120 }, { types: [ayt, "AYT"], max: 80 }];
}

function pickForecastCandidate(profiles = [], trials = [], examDate) {
  const candidates = profiles.map((profile) => {
    const profileTrials = (trials || []).filter((trial) => profile.types.includes(trial.trialType));
    const forecast = forecastNet(profileTrials, examDate, profile.max, profile.types);
    return { ...profile, trials: profileTrials, forecast, count: profileTrials.length };
  });
  return candidates
    .sort((a, b) => {
      if (Boolean(a.forecast) !== Boolean(b.forecast)) return a.forecast ? -1 : 1;
      return b.count - a.count;
    })[0] || null;
}

class RouteReadError extends Error {
  constructor(failures) {
    super(`Rota okuma hatası: ${failures.map((f) => f.source).join(", ")}`);
    this.name = "RouteReadError";
    this.code = "route_read_failed";
    this.failures = failures;
    this.sourceKeys = failures.map((f) => f.source);
  }
}

function failedRouteRead(source, result) {
  if (result.status !== "rejected") return null;
  return {
    source,
    message: result.reason?.message || String(result.reason || "unknown"),
    reason: result.reason,
  };
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
// Onbellek anahtari icin satir imzasi.
//
// Eskiden burada yalnizca dizi UZUNLUGU vardi. Mevcut bir calisma kaydinin
// soru sayisini duzeltince uzunluk ayni kaliyor, rota yeniden HESAPLANMIYORDU.
// Calisma gecmisi ekraninda satir duzenlenebildigi icin erisilebilir bir yoldu.
//
// FNV-1a: anahtar kisa kalsin diye. Diziler usePlanContext'te onbellekli,
// yani bu yalniz veri gercekten degisince calisir.
function rowsHash(rows) {
  if (!rows || !rows.length) return "0";
  let h = 0x811c9dc5;
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    for (const key of Object.keys(row)) {
      const v = row[key];
      if (v === null || v === undefined || typeof v === "object") continue;
      const str = key + ":" + v + ";";
      for (let i = 0; i < str.length; i += 1) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
      }
    }
  }
  return (h >>> 0).toString(36) + "." + rows.length;
}

export function useStudyRoute({ pausedWeeks = null, persist = true } = {}) {
  const { examType, field, examDate } = useExam();
  const { user } = useAuth();
  const resolvedExamType = examType || "tyt_ayt";
  const effectiveUserId = user?.id || "local_user";
  const { accessError, accessLoading, checkFeature, refreshUsage } = usePremium();
  const hasRouteAccess = !PREMIUM_ENABLED || (!accessLoading && checkFeature("detailed_roadmap"));
  const [pastWeeks, setPastWeeks] = useState([]);
  const [routeState, setRouteStateLocal] = useState(null);
  const [routeCreating, setRouteCreating] = useState(false);
  const [routeCreationError, setRouteCreationError] = useState(null);
  const [routeLoadError, setRouteLoadError] = useState(null);
  const [routeLoadTick, setRouteLoadTick] = useState(0);
  const routeLoadKeyRef = useRef(null);

  useEffect(() => {
    return onRouteUpdated(() => {
      setRouteLoadTick((tick) => tick + 1);
    });
  }, []);

  const isPaused = isRoutePausedForExam(routeState, resolvedExamType);
  const recoveryWeek = useMemo(() => {
    if (pausedWeeks != null) return pausedWeeks;
    if (!routeState?.paused_at || !routeState?.resumed_at || isPaused) return null;
    if (routeState.exam_type && routeState.exam_type !== resolvedExamType) return null;
    const pauseWeeks = (new Date(routeState.resumed_at) - new Date(routeState.paused_at)) / 604800000;
    if (pauseWeeks < 1) return null;
    return Math.max(0, Math.floor((Date.now() - new Date(routeState.resumed_at)) / 604800000));
  }, [resolvedExamType, isPaused, pausedWeeks, routeState?.exam_type,
    routeState?.paused_at, routeState?.resumed_at]);
  const [persistedStops, setPersistedStops] = useState([]);
  // persistedStops bos olmasi 'rota yok' demek DEGIL; henuz gelmemis de olabilir.
  // Bu ayrim olmadan Rota ekrani yuklenirken 'Yol buradan basliyor' bosunu basiyordu.
  const [stopsLoaded, setStopsLoaded] = useState(false);
  const { dataHealth, weekLogs, topicRows } = usePlanContext();
  const { wrongsByTopic, wrongsHash, wrongsSettled } = useRouteWrongSignal(user?.id, routeLoadTick);
  // Gun ritmi: gun dagitiminin girdisi, tum ekranlar ayni degeri okur.
  useEffect(() => {
    setWeekdayRhythm(weekdayRhythm(weekLogs || [], toDateKey(startOfWeekTR(new Date()))));
  }, [weekLogs]);
  const trials = useSelector(selectTrials);
  const goals = useSelector(selectGoals);
  const allowedTrialTypes = useMemo(
    () => trialTypesForRoute(resolvedExamType, field), [resolvedExamType, field],
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

  const forecastCandidate = useMemo(
    () => pickForecastCandidate(forecastProfilesForRoute(examType, field), trials, examDate),
    [examDate, examType, field, trials],
  );
  // Hedefi koruma modu: tahminin sinavindaki SON net hedefe ulastiysa rota
  // yeni konu kovalamak yerine tekrari ve yanlislari one alir.
  const { target: forecastTargetNet } = useForecastTarget(forecastCandidate?.types || []);
  const targetReached = useMemo(() => {
    const latest = latestNetOf(forecastCandidate?.trials || []);
    return Number.isFinite(latest) && Number.isFinite(forecastTargetNet) && forecastTargetNet > 0
      && latest >= forecastTargetNet;
  }, [forecastCandidate, forecastTargetNet]);

  // Gunluk rutinlerin haftalik yuku: rota butcesinden dusulur.
  const { habits, settled: habitsSettled } = useRouteHabits();
  const { schedule } = useClassSchedule();
  const habitLoad = useMemo(
    () => (habits.length ? habitWeeklyLoad(habits, studyWeekdays(schedule).length) : null),
    [habits, schedule],
  );

  // Durak sonrasi geri bildirim: konunun zorlugu kisiye gore.
  const topicFeel = useMemo(() => topicFeelFromLogs(weekLogs || []), [weekLogs]);

  // Denemeden orantili ders agirligi: ne kadar gerideyse o kadar one.
  const subjectWeakness = useMemo(() => subjectWeaknessFactors(
    (trials || []).filter((trial) => allowedTrialTypes.includes(trial.trialType)),
  ), [allowedTrialTypes, trials]);

  const routeCacheKey = useMemo(() => [
    resolvedExamType,
    field || "",
    hasRouteAccess ? "1" : "0",
    goals?.dailyQuestions || 20,
    daysLeft ?? "",
    recoveryWeek ?? "",
    dataHealth?.logs || "",
    weakSubjectKeys.join(","),
    JSON.stringify(subjectWeakness),
    wrongsHash,
    targetReached ? "keep" : "",
    habitLoad ? habitLoad.questionsPerWeek : "",
    rowsHash(weekLogs),
    rowsHash(topicRows),
  ].join("|"), [
    resolvedExamType, field, hasRouteAccess, goals?.dailyQuestions, daysLeft,
    recoveryWeek, dataHealth?.logs, weakSubjectKeys, subjectWeakness, wrongsHash, targetReached, habitLoad, weekLogs, topicRows,
  ]);

  const computedRoute = useMemo(() => cachedBuildRoute({
    pool: hasRouteAccess ? getSubjectsForExam(resolvedExamType, field) : [],
    progressByKey,
    studyLogs: weekLogs || [],
    dailyQuestionGoal: goals?.dailyQuestions || 20,
    daysLeft,
    weakSubjectKeys,
    subjectWeakness,
    wrongsByTopic,
    targetReached,
    topicFeel,
    habitLoad,
    pausedWeeks: recoveryWeek,
    examType: resolvedExamType,
    studyLogDataState: dataHealth?.logs,
 }, routeCacheKey), [subjectWeakness, wrongsByTopic, targetReached, topicFeel, habitLoad, dataHealth?.logs, resolvedExamType, field, hasRouteAccess, progressByKey, weekLogs,
    goals?.dailyQuestions, daysLeft, weakSubjectKeys, recoveryWeek, routeCacheKey]);

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
            // Tamamlanma ani. "Bugun kac durak tamamlandi" buna dayaniyor.
            // updated_at KULLANILMAZ: rota her yeniden cizildiginde yeni
            // revizyona kopyalanan durakta updated_at o anki saat olur; gecen
            // hafta biten durak "bugun bitti" sanilip bugunun listesine
            // giriyordu. status_changed_at revizyonlar arasinda korunuyor.
            completedAt: saved.completed_at || saved.status_changed_at || null,
            version: saved.version,
            insight: saved.metadata?.insight || stop.insight,
          } : stop;
        }),
      }))),
    };
  }, [computedRoute, persistedStops]);

  const forecastProfile = forecastCandidate;
  const forecastTrials = forecastCandidate?.trials || [];
  const forecastMax = forecastProfile?.max ?? 120;
  const forecast = forecastCandidate?.forecast || null;
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
  const routeRevisionPreview = useMemo(() => summarizeRouteRevision({
    previousWeeks: pastWeeks,
    nextWeeks: computedRoute.weeks,
    nextRevision: computedRoute.revision,
  }), [computedRoute.revision, computedRoute.weeks, pastWeeks]);
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
      // Acik tek sinavin (tahminin sinavi) acigi: onu kapatacak konular da o
      // sinavin derslerinden. Eskiden TYT acigi icin AYT konulari da geliyordu.
      pool: examType ? examPool(getSubjectsForExam(examType, field), forecastProfile?.types) : [],
      progressByKey,
      trialType: examType === "lgs" ? "LGS" : undefined,
    }),
    [route, examType, field, progressByKey, forecastProfile?.types],
  );

  // Geçmiş planı sunucudan çek — borcun "planlanan" tarafı.
  // examType filtresi kritik: kullanıcı YKS↔LGS geçtiyse eski müfredatın
  // planı borç sayılmamalı.
  useEffect(() => {
    if (!hasRouteAccess) {
      routeLoadKeyRef.current = null;
      setPastWeeks([]);
      setRouteStateLocal(null);
      setPersistedStops([]);
      setRouteLoadError(null);
      setStopsLoaded(true);
      return;
    }
    let cancelled = false;
    const loadKey = `${effectiveUserId}:${resolvedExamType}`;
    routeLoadKeyRef.current = loadKey;
    setStopsLoaded(false);
    setRouteLoadError(null);
    setPastWeeks([]);
    setRouteStateLocal(null);
    setPersistedStops([]);
    Promise.allSettled([
      user?.id && user.id !== "dev" ? getRouteWeeks(user.id, { examType }) : Promise.resolve([]),
      user?.id && user.id !== "dev" ? getRouteState(user.id, examType) : Promise.resolve(null),
      user?.id && user.id !== "dev" ? getLatestRouteStops(user.id, examType) : Promise.resolve([]),
    ]).then(async ([weeksResult, stateResult, stopsResult]) => {
      if (cancelled) return;
      if (routeLoadKeyRef.current !== loadKey) return;
      let loadedWeeks = weeksResult.status === "fulfilled" ? weeksResult.value : [];
      let loadedState = stateResult.status === "fulfilled" ? stateResult.value : null;
      let loadedStops = stopsResult.status === "fulfilled" ? stopsResult.value : [];

      if (!loadedStops || loadedStops.length === 0) {
        try {
          loadedStops = (await appStorage.getJson(userScopedKey(STORAGE_KEYS.ROUTE_STOPS, effectiveUserId), [])) || [];
        } catch (_) {}
      }
      if (!loadedWeeks || loadedWeeks.length === 0) {
        try {
          loadedWeeks = (await appStorage.getJson(userScopedKey(STORAGE_KEYS.ROUTE_WEEKS, effectiveUserId), [])) || [];
        } catch (_) {}
      }

      setPastWeeks(loadedWeeks);
      if (loadedState) setRouteStateLocal(loadedState);
      setPersistedStops(loadedStops);

      const failures = [
        failedRouteRead("route_weeks", weeksResult),
        failedRouteRead("route_state", stateResult),
        failedRouteRead("route_stops", stopsResult),
      ].filter(Boolean);
      if (failures.length && (!loadedStops || loadedStops.length === 0)) {
        const error = new RouteReadError(failures);
        setRouteLoadError(error);
        captureError(error, {
          context: "route_read",
          sources: error.sourceKeys,
          examType: resolvedExamType,
        });
      }
    }).finally(() => {
      if (!cancelled && routeLoadKeyRef.current === loadKey) setStopsLoaded(true);
    });
    return () => { cancelled = true; };
  }, [effectiveUserId, resolvedExamType, hasRouteAccess, routeLoadTick, user?.id]);

  // Rota çizildiğinde haftaları sakla. Bu olmadan borç her zaman sıfır çıkar.
  useEffect(() => {
    if (!persist || !user?.id || user.id === "dev" || !hasRouteAccess || isPaused) return;
    if (!computedRoute.weeks?.length) return;
    // Girdiler gelmeden yazma: her acilista once rutinsiz/yanlissiz, sonra
    // tam rota olmak uzere birden cok revizyon yaziliyordu.
    if (!stopsLoaded || !habitsSettled || !wrongsSettled) return;
    const persistence = routePersistenceDecision({
      mode: "auto",
      routeCreated,
      revisionSummary: routeRevisionPreview,
    });
    if (!persistence.shouldPersist) return;
    persistRouteOnce(user.id, computedRoute.weeks, resolvedExamType, computedRoute.revision)
      .then(setPersistedStops)
      .catch((error) => {
        setRouteLoadError(error);
        captureError(error, { context: "route_auto_persist", examType: resolvedExamType });
      });
  }, [persist, user?.id, resolvedExamType, hasRouteAccess, isPaused,
    computedRoute.weeks, computedRoute.revision, routeCreated, routeRevisionPreview,
    stopsLoaded, habitsSettled, wrongsSettled]);

  const createRoute = useCallback(async (options = {}) => {
    if (!hasRouteAccess) {
      throw new Error("route_access_unavailable");
    }
    const targetWeeks = (computedRoute.weeks && computedRoute.weeks.length > 0)
      ? computedRoute.weeks
      : cachedBuildRoute({
          pool: getSubjectsForExam(resolvedExamType, field),
          progressByKey,
          studyLogs: weekLogs || [],
          dailyQuestionGoal: goals?.dailyQuestions || 20,
          daysLeft,
          weakSubjectKeys,
          pausedWeeks: recoveryWeek,
          examType: resolvedExamType,
          studyLogDataState: dataHealth?.logs,
        }, `fallback_${resolvedExamType}`).weeks;

    if (!targetWeeks || targetWeeks.length === 0) {
      throw new Error("route_preview_unavailable");
    }
    setRouteCreating(true);
    setRouteCreationError(null);
    try {
      const revisionSummary = summarizeRouteRevision({
        previousWeeks: pastWeeks,
        nextWeeks: targetWeeks,
        nextRevision: computedRoute.revision,
      });

      // Prepare local stops fallback with ONLY the first stop active, rest upcoming
      let activated = false;
      const localStops = [];
      for (const week of targetWeeks) {
        for (const stop of week.stops || []) {
          const isActive = !activated;
          if (isActive) activated = true;
          localStops.push({
            id: `local_${stop.logicalStopKey}`,
            logical_key: stop.logicalStopKey,
            root_key: stop.rootStopKey || stop.logicalStopKey,
            subject: stop.subject,
            subject_label: stop.subjectLabel || stop.subject,
            topic: stop.topic,
            week_start: week.weekStart,
            position: stop.position ?? 0,
            segment_index: stop.segmentIndex ?? 0,
            stop_kind: stop.isReview ? "review" : "learn",
            lifecycle_status: isActive ? "active" : "upcoming",
            version: 1,
            metadata: stop,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      if (options.initialActiveStop) {
        const { subjectKey, topicName, durationMinutes, subjectLabel } = options.initialActiveStop;
        const customRootKey = makeRouteStopRootKey({ subject: subjectKey, topic: topicName }, resolvedExamType);
        for (const s of localStops) {
          if (s.lifecycle_status === "active") s.lifecycle_status = "upcoming";
        }
        const customStop = {
          id: `local_${customRootKey}_${Date.now()}`,
          logical_key: `${customRootKey}:custom_0`,
          root_key: customRootKey,
          subject: subjectKey,
          subject_label: subjectLabel || subjectKey,
          topic: topicName,
          week_start: targetWeeks[0]?.weekStart || startOfWeekTR(new Date()),
          position: 0,
          segment_index: 0,
          stop_kind: "learn",
          lifecycle_status: "active",
          version: 1,
          metadata: {
            questions: durationMinutes ? Math.round(durationMinutes * 0.8) : 20,
            minutes: durationMinutes || 50,
            userAdded: true,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localStops.unshift(customStop);
      }

      const localWeeks = targetWeeks.map((w, i) => ({
        weekNo: i + 1,
        weekStart: w.weekStart,
        week_start: w.weekStart,
        plannedQuestions: Math.max(0, Math.round(w.plannedQuestions || 0)),
        planned_questions: Math.max(0, Math.round(w.plannedQuestions || 0)),
        plannedMinutes: Math.max(0, Math.round(w.plannedMinutes || 0)),
        planned_minutes: Math.max(0, Math.round(w.plannedMinutes || 0)),
        stops: w.stops || [],
        examType: resolvedExamType,
        exam_type: resolvedExamType,
      }));

      // Cache locally immediately to ensure durability (offline & 42501 resilience)
      try {
        await Promise.all([
          appStorage.setJson(userScopedKey(STORAGE_KEYS.ROUTE_STOPS, effectiveUserId), localStops),
          appStorage.setJson(userScopedKey(STORAGE_KEYS.ROUTE_WEEKS, effectiveUserId), localWeeks),
        ]);
      } catch (_) {}

      if (user?.id && user.id !== "dev") {
        try {
          await saveRouteWeeks(
            user.id,
            targetWeeks,
            resolvedExamType,
            computedRoute.revision,
          );
        } catch (err) {
          captureError(err, { context: "create_route_save_remote", examType: resolvedExamType });
        }
      }

      let stops = [];
      let rows = [];
      if (user?.id && user.id !== "dev") {
        try {
          [stops, rows] = await Promise.all([
            getLatestRouteStops(user.id, resolvedExamType),
            getRouteWeeks(user.id, { examType: resolvedExamType }),
          ]);
        } catch (_) {}
      }

      if (!stops || stops.length === 0) {
        stops = localStops;
      } else {
        try {
          await appStorage.setJson(userScopedKey(STORAGE_KEYS.ROUTE_STOPS, effectiveUserId), stops);
        } catch (_) {}
      }

      if (!rows || rows.length === 0) {
        rows = localWeeks;
      }

      setPersistedStops(stops);
      setPastWeeks(rows);
      emitRouteUpdated({ action: "created", stops, weeks: rows });

      track(EVENTS.ROUTE_CREATED, {
        examType: resolvedExamType,
        confidence: computedRoute.intelligence?.confidence || "low",
        weeks: targetWeeks.length,
        changed: revisionSummary.changed,
        added: revisionSummary.counts.added,
        removed: revisionSummary.counts.removed,
        moved: revisionSummary.counts.moved,
        resized: revisionSummary.counts.resized,
      });
      return { stops, weeks: rows, revisionSummary };
    } catch (e) {
      setRouteCreationError("Rota oluşturulamadı. Bağlantını kontrol edip tekrar dene.");
      track(EVENTS.ROUTE_CREATION_FAILED, { examType: resolvedExamType });
      throw e;
    } finally {
      setRouteCreating(false);
    }
  }, [computedRoute.intelligence?.confidence, computedRoute.revision,
    computedRoute.weeks, dataHealth?.logs, daysLeft, effectiveUserId, field,
    goals?.dailyQuestions, hasRouteAccess, pastWeeks, progressByKey,
    recoveryWeek, resolvedExamType, user?.id, weakSubjectKeys, weekLogs]);

  // Borç: bitmiş haftaların kapanmamış durakları. Haftalık toplamdan değil,
  // kullanıcının gerçekten açık kalan route stop'larından türetilir.
  const debt = useMemo(() => {
    const overdue = overdueStops({
      stops: persistedStops,
      logs: weekLogs,
      thisMonday: startOfWeekTR(new Date()),
      minutesPerWeek: route.capacity?.minutesPerWeek || 0,
    });
    const totalQuestions = Math.round((overdue.totalMinutes || 0) / MIN_PER_QUESTION);
    return {
      ...overdue,
      totalQuestions,
      hasDebt: (overdue.totalMinutes || 0) > 0,
    };
  }, [route.capacity?.minutesPerWeek, weekLogs, persistedStops]);

  const pause = useCallback(async () => {
    if (!user?.id) return;
    const next = await pauseRoute(user.id, examType);
    if (next) setRouteStateLocal(next);
  }, [examType, user?.id]);

  const resume = useCallback(async () => {
    if (!user?.id) return;
    const next = await resumeRoute(user.id, examType);
    if (next) setRouteStateLocal(next);
  }, [examType, user?.id]);

  const transitionStop = useCallback(async (stop, transition, payload = {}) => {
    if (!stop?.stopId) throw new Error("route_stop_not_persisted");
    const version = stop.version ?? 1;

    if (String(stop.stopId).startsWith("local_")) {
      const now = new Date().toISOString();
      const updated = {
        id: stop.stopId,
        lifecycle_status: transition,
        updated_at: now,
        status_changed_at: now,
        version: version + 1,
        subject: stop.subject,
      };
      setPersistedStops((current) => {
        const next = (current || []).map((item) => (
          item.id === updated.id ? { ...item, ...updated } : item
        ));
        appStorage.setJson(userScopedKey(STORAGE_KEYS.ROUTE_STOPS, effectiveUserId), next).catch(() => {});
        return next;
      });
      emitRouteUpdated({ action: "transition", stop: updated });
      track(EVENTS.ROUTE_STOP_TRANSITIONED, {
        transition,
        subject: updated.subject || stop.subject,
        source: payload.source || "unknown",
      });
      return updated;
    }

    const routeResult = await saveRouteStopTransitionOffline({
      userId: user?.id,
      stopId: stop.stopId,
      transition,
      expectedVersion: version,
      clientOperationId: Crypto.randomUUID(),
      payload,
    });
    if (routeResult.error && !routeResult.queued) throw routeResult.error;
    const updated = routeResult.data || (routeResult.queued ? {
      id: stop.stopId,
      lifecycle_status: transition,
      updated_at: new Date().toISOString(),
      status_changed_at: new Date().toISOString(),
      version: version + 1,
      subject: stop.subject,
    } : null);
    if (updated) {
      setPersistedStops((current) => current.map((item) => (
        item.id === updated.id ? { ...item, ...updated } : item
      )));
      if (user?.id && examType && routeResult.saved) {
        getLatestRouteStops(user.id, examType)
          .then(setPersistedStops)
          .catch(() => {});
      }
      emitRouteUpdated({ action: "transition", stop: updated });
      track(EVENTS.ROUTE_STOP_TRANSITIONED, {
        transition,
        subject: updated.subject || stop.subject,
        source: payload.source || "unknown",
      });
    }
    return updated;
  }, [effectiveUserId, examType, user?.id]);
  const distributeRouteDebt = useCallback(
    (weeks) => distributeDebt(debt.totalQuestions, weeks || route.weeks, route.capacity),
    [debt.totalQuestions, route.capacity, route.weeks],
  );
  const retryRouteLoad = useCallback(() => setRouteLoadTick((tick) => tick + 1), []);

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
    forecastTypes: forecastProfile?.types || [],
    // Tahminle ayni sinav ailesinin denemeleri: net grafiginin noktalari
    // tahmine bagli olmadan buradan cizilir (netChartData).
    forecastTrials,
    // Tahminle ayni sinavin SON denemesi. Tahmin kisa veride (14 gunden az
    // aralik) null donuyor; "su anki net" buna bagli kalmamali.
    latestForecastNet: latestNetOf(forecastTrials),
    hasRouteAccess,
    routeAccessError: accessError,
    routeAccessLoading: PREMIUM_ENABLED ? accessLoading : false,
    refreshRouteAccess: refreshUsage,
    routeCreated,
    routeStopsLoaded: stopsLoaded,
    // Kayitli duraklar (gecmis haftalar dahil) ve son 45 gunun kayitlari:
    // Geride kalan konular durak bazinda hesaplanir (overdueStops).
    savedStops: persistedStops,
    recentLogs: weekLogs,
    routeRevisionPreview,
    routeReadiness,
    routeCreating,
    routeCreationError,
    routeLoadError,
    retryRouteLoad,
    createRoute,
    threshold,
    debt,
    debtWeeks: debt.weeks,
    // Ara verme / dondurma — tasarım AKIŞ 2.
    isPaused,
    // Donma ani. Deger zaten routeState'te vardi ama disa verilmiyordu;
    // "Rotan N gundur duruyor" cumlesi buna dayaniyor (Rota Donduruldu hero'su).
    pausedAt: routePausedAtForExam(routeState, examType),
    pause,
    resume,
    transitionStop,
    distributeDebt: distributeRouteDebt,
  };
}
