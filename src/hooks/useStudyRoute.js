import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { buildRoute, simulateScenario, thresholdGap, computeDebt, distributeDebt, debtInWeeks } from "../lib/routeEngine";
import { usePlanContext } from "./usePlanContext";
import { useExam } from "../contexts/ExamContext";
import { getSubjectsForExam } from "../data/curriculum";
import { selectTrials } from "../store/slices/trialSlice";
import { selectGoals } from "../store/slices/goalsSlice";
import { startOfWeekTR } from "../lib/dateUtils";
import { TRIAL_TO_CURRICULUM } from "../domain/trial/trialKeyMap";
import { useAuth } from "../contexts/AuthContext";
import { saveRouteWeeks, getRouteWeeks, getRouteState, pauseRoute, resumeRoute } from "../supabase/routePlan";

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
export function useStudyRoute({ pausedWeeks = 0, persist = true } = {}) {
  const { examType, field, examDate } = useExam();
  const { user } = useAuth();
  const [pastWeeks, setPastWeeks] = useState([]);
  const [routeState, setRouteStateLocal] = useState(null);
  const { weekLogs, topicRows } = usePlanContext();
  const trials = useSelector(selectTrials);
  const goals = useSelector(selectGoals);

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
    const recent = [...(trials || [])].slice(0, 5);
    if (!recent.length) return [];
    const acc = {};
    for (const t of recent) {
      for (const [key, val] of Object.entries(t.subjects || {})) {
        if (val?.net == null) continue;
        if (!acc[key]) acc[key] = [];
        acc[key].push(val.net);
      }
    }
    // Deneme anahtarları (tyt_matematik, ayt_fizik) MÜFREDAT anahtarlarına
    // çevrilmeli. Çevrilmezse weakSet.has(subject.key) hiçbir TYT/LGS dersinde
    // eşleşmez ve zayıf-alan önceliği fiilen devre dışı kalır.
    const weakest = Object.entries(acc)
      .map(([key, nets]) => [key, nets.reduce((a, b) => a + b, 0) / nets.length])
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([key]) => key);

    const curriculumKeys = new Set();
    for (const trialKey of weakest) {
      const mapped = TRIAL_TO_CURRICULUM[trialKey];
      if (mapped?.length) mapped.forEach((k) => curriculumKeys.add(k));
      else curriculumKeys.add(trialKey); // eşleme yoksa olduğu gibi dene
    }
    return [...curriculumKeys];
  }, [trials]);

  const route = useMemo(() => buildRoute({
    // examType yoksa rota HESAPLANMAZ. "tyt" varsaymak LGS kullanıcısının
    // rotasını yanlış müfredatla çizerdi.
    pool: examType ? getSubjectsForExam(examType, field) : [],
    progressByKey,
    studyLogs: weekLogs || [],
    dailyQuestionGoal: goals?.dailyQuestions || 20,
    daysLeft,
    weakSubjectKeys,
    pausedWeeks,
  }), [examType, field, progressByKey, weekLogs, goals?.dailyQuestions, daysLeft, weakSubjectKeys, pausedWeeks]);

  const scenario = useMemo(
    () => (questionsPerWeek) => simulateScenario(route, questionsPerWeek),
    [route],
  );

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
    if (!user?.id || !examType) return;
    let cancelled = false;
    getRouteWeeks(user.id, { examType })
      .then((rows) => { if (!cancelled) setPastWeeks(rows); })
      .catch(() => {});
    getRouteState(user.id)
      .then((st) => { if (!cancelled) setRouteStateLocal(st); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id, examType]);

  // Rota çizildiğinde haftaları sakla. Bu olmadan borç her zaman sıfır çıkar.
  useEffect(() => {
    if (!persist || !user?.id || !examType) return;
    if (!route.weeks?.length) return;
    saveRouteWeeks(user.id, route.weeks, examType).catch(() => {});
  }, [persist, user?.id, examType, route.weeks]);

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

  // Ara verme / dondurma. Hook'lar return nesnesinin içinde tanımlanamaz —
  // sıraları bozulmasa da okunması ve bakımı kırılgan olur.
  const isPaused = !!routeState?.paused_at && !routeState?.resumed_at;

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

  return {
    route,
    capacity: route.capacity,
    weeks: route.weeks,
    currentWeek: route.weeks[0] || null,
    feasible: route.feasible,
    shortfall: route.shortfall,
    totals: route.totals,
    daysLeft,
    scenario,
    threshold,
    debt,
    debtWeeks: debtInWeeks(debt.totalQuestions, route.capacity),
    // Ara verme / dondurma — tasarım AKIŞ 2.
    isPaused,
    pause,
    resume,
    distributeDebt: (weeks) => distributeDebt(debt.totalQuestions, weeks || route.weeks, route.capacity),
  };
}
