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

// C) HomeScreen ve PlanDetailScreen için ortak plan bağlamı.
// Son 3 deneme ağırlıklı zayıflık + 7 günlük çalışma + konu zayıflığı + nudge sinyalleri.
export function usePlanContext() {
  const { user } = useAuth();
  const { examType, field, examDate } = useExam();
  const trials = useAppSelector(selectTrials);
  const todayLogs = useAppSelector(selectTodayLogs);
  const dailyTarget = useAppSelector(selectDailyQuestionsGoal);

  const [weekLogs, setWeekLogs] = useState([]);
  const [topicRows, setTopicRows] = useState([]);
  const [srDue, setSrDue] = useState(0);

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    let cancelled = false;
    const to = new Date();
    const from = new Date(Date.now() - 7 * 86400000);
    const fmt = (d) => d.toISOString().split("T")[0];

    Promise.allSettled([
      getStudyLogs(user.id, { from: fmt(from), to: fmt(to) }),
      getTopicProgress(user.id),
      getDueWrongQuestions(user.id),
    ]).then(([logsRes, topicRes, dueRes]) => {
      if (cancelled) return;
      if (logsRes.status === "fulfilled") setWeekLogs(logsRes.value || []);
      if (topicRes.status === "fulfilled") setTopicRows(topicRes.value || []);
      if (dueRes.status === "fulfilled") setSrDue((dueRes.value || []).length);
    });
    return () => { cancelled = true; };
  }, [user?.id]);

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
