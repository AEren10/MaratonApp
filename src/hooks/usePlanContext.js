import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useExam } from "../contexts/ExamContext";
import { useAppSelector } from "../store/hooks";
import { selectTrials } from "../store/slices/trialSlice";
import { selectTodayLogs } from "../store/slices/studyLogSlice";
import { selectDailyQuestionsGoal } from "../store/slices/goalsSlice";
import { getStudyLogs } from "../supabase/studyLogs";
import { getTopicProgress } from "../supabase/topicProgress";
import { getDueWrongQuestions } from "../supabase/wrongQuestions";
import { generateNudges } from "../lib/smartNudge";
import { TRIAL_TO_CURRICULUM } from "../screens/trial/trialKeyMap";
import { weightedWeakAreas, buildRecentStudy, buildTopicWeakness } from "../lib/buildPlanContext";

// Net-düşüş nudge'larını curriculum key → gerekçe mesajı haritasına çevir.
function nudgesToPriorityReasons(nudges) {
  const map = {};
  nudges.forEach((n) => {
    if (n.type !== "net_drop") return;
    const targets = TRIAL_TO_CURRICULUM[n.subject] || [n.subject];
    targets.forEach((k) => { if (!map[k]) map[k] = n.message; });
  });
  return map;
}

// Module-level cache — paylaşılan veri, her instance sıfırdan fetch etmesin.
let _cache = { uid: null, weekLogs: [], topicRows: [], srDue: 0 };

// C) HomeScreen ve PlanDetailScreen için ortak plan bağlamı.
// Son 3 deneme ağırlıklı zayıflık + 7 günlük çalışma + konu zayıflığı + nudge sinyalleri.
export function usePlanContext() {
  const { user } = useAuth();
  const { examType, field, examDate } = useExam();
  const trials = useAppSelector(selectTrials);
  const todayLogs = useAppSelector(selectTodayLogs);
  const dailyTarget = useAppSelector(selectDailyQuestionsGoal);

  const uid = user?.id;
  const cached = uid && uid === _cache.uid;

  const [weekLogs, setWeekLogs] = useState(cached ? (_cache.weekLogs || []) : []);
  const [topicRows, setTopicRows] = useState(cached ? (_cache.topicRows || []) : []);
  const [srDue, setSrDue] = useState(cached ? (_cache.srDue || 0) : 0);

  useEffect(() => {
    if (!uid || uid === "dev") return;
    if (uid === _cache.uid && _cache.weekLogs.length > 0) {
      setWeekLogs(_cache.weekLogs);
      setTopicRows(_cache.topicRows);
      setSrDue(_cache.srDue);
      return;
    }
    let cancelled = false;
    const to = new Date();
    const from = new Date(Date.now() - 7 * 86400000);
    const fmt = (d) => d.toISOString().split("T")[0];

    Promise.allSettled([
      getStudyLogs(uid, { from: fmt(from), to: fmt(to) }),
      getTopicProgress(uid),
      getDueWrongQuestions(uid),
    ]).then(([logsRes, topicRes, dueRes]) => {
      if (cancelled) return;
      const wl = logsRes.status === "fulfilled" ? (logsRes.value || []) : [];
      const tr = topicRes.status === "fulfilled" ? (topicRes.value || []) : [];
      const dueVal = dueRes.status === "fulfilled" ? (dueRes.value || []) : [];
      const sd = Array.isArray(dueVal) ? dueVal.length : 0;
      _cache = { uid, weekLogs: wl, topicRows: tr, srDue: sd };
      setWeekLogs(wl);
      setTopicRows(tr);
      setSrDue(sd);
    });
    return () => { cancelled = true; };
  }, [uid]);

  return useMemo(() => {
    const weakAreas = weightedWeakAreas(trials);
    // 7 günlük log varsa onu kullan; yoksa bugünküne düş (graceful fallback).
    const recentStudy = buildRecentStudy(weekLogs.length ? weekLogs : todayLogs);
    const topicWeakness = buildTopicWeakness(topicRows);
    const nudges = generateNudges({ recentStudy, trials, streak: 0, weakAreas });
    const priorityReasons = nudgesToPriorityReasons(nudges);
    return { examType, field, examDate, weakAreas, recentStudy, topicWeakness, priorityReasons, nudges, srDue, dailyTarget };
  }, [trials, weekLogs, todayLogs, topicRows, srDue, examType, field, examDate, dailyTarget]);
}
