import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { useAuth } from "../contexts/AuthContext";
import { getStudyLogs } from "../supabase/studyLogs";
import { selectTrials } from "../store/slices/trialSlice";
import { selectDailyQuestionsGoal } from "../store/slices/goalsSlice";
import { dateKey } from "../lib/dateUtils";

const DEFAULT_GOAL = 80;

// Takvim ve Seri ekraninin ay verisi: calisma kayitlari + denemeler gun
// gun, ay ozeti (hedef tuttu / seri surdu gunleri, soru). Ekranda is
// mantigi kalmasin diye CalendarScreen'den tasindi.
export function useCalendarMonth(initialOffset = 0) {
  const { user } = useAuth();
  const trials = useSelector(selectTrials);
  const dailyGoal = useSelector(selectDailyQuestionsGoal) || DEFAULT_GOAL;
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + initialOffset, 1);
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const from = useMemo(() => dateKey(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)), [monthDate]);
  const to = useMemo(() => dateKey(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)), [monthDate]);

  useEffect(() => {
    if (!user?.id || user.id === "dev") { setLoading(false); return undefined; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getStudyLogs(user.id, { from, to })
      .then((data) => { if (!cancelled) setLogs(data || []); })
      .catch((e) => { if (!cancelled) { setLogs([]); setError(e?.message || "load_failed"); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id, from, to, tick]);

  const dayMap = useMemo(() => {
    const map = {};
    const slot = (d) => (map[d] = map[d] || { logs: [], trials: [], totalMinutes: 0, totalQuestions: 0 });
    logs.forEach((l) => {
      const day = slot(l.study_date);
      day.logs.push(l);
      day.totalMinutes += l.duration ?? l.duration_minutes ?? 0;
      day.totalQuestions += l.questionCount ?? l.question_count ?? 0;
    });
    (trials || []).forEach((t) => {
      if (t.date >= from && t.date <= to) slot(t.date).trials.push(t);
    });
    return map;
  }, [logs, trials, from, to]);

  const stats = useMemo(() => {
    let goalDays = 0;
    let keptDays = 0;
    let questions = 0;
    Object.values(dayMap).forEach((d) => {
      questions += d.totalQuestions;
      if (d.totalQuestions >= dailyGoal) goalDays += 1;
      else if (d.logs.length) keptDays += 1;
    });
    const active = goalDays + keptDays;
    return { goalDays, keptDays, questions, goalRatio: active > 0 ? goalDays / active : 0 };
  }, [dayMap, dailyGoal]);

  const now = new Date();
  const isPastMonth = monthDate.getFullYear() * 12 + monthDate.getMonth() < now.getFullYear() * 12 + now.getMonth();

  return {
    monthDate,
    dayMap,
    stats,
    dailyGoal,
    loading,
    error,
    isPastMonth,
    reload: useCallback(() => setTick((n) => n + 1), []),
    prevMonth: useCallback(() => setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)), []),
    nextMonth: useCallback(() => setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)), []),
  };
}
