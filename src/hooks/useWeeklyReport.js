import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectTrials } from "../store/slices/trialSlice";
import { useAuth } from "../contexts/AuthContext";
import { getStudyLogs } from "../supabase/studyLogs";

function startOfWeek() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // monday=0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

function endOfWeek() {
  const start = startOfWeek();
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function toIso(d) {
  return d.toISOString().split("T")[0];
}

export function useWeeklyReport() {
  const { user } = useAuth();
  const trials = useSelector(selectTrials);
  const [logs, setLogs] = useState([]);

  const todayKey = toIso(new Date());
  const weekStart = useMemo(() => startOfWeek(), [todayKey]);
  const weekEnd = useMemo(() => endOfWeek(), [todayKey]);

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    let cancelled = false;
    getStudyLogs(user.id, {
      from: toIso(weekStart),
      to: toIso(weekEnd),
    })
      .then((data) => {
        if (!cancelled) setLogs(data || []);
      })
      .catch(() => {
        if (!cancelled) setLogs([]);
      });
    return () => { cancelled = true; };
  }, [user?.id, weekStart, weekEnd]);

  const [prevLogs, setPrevLogs] = useState([]);

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    let cancelled = false;
    const ps = new Date(weekStart);
    ps.setDate(ps.getDate() - 7);
    const pe = new Date(weekStart);
    pe.setDate(pe.getDate() - 1);
    getStudyLogs(user.id, { from: toIso(ps), to: toIso(pe) })
      .then((data) => { if (!cancelled) setPrevLogs(data || []); })
      .catch(() => { if (!cancelled) setPrevLogs([]); });
    return () => { cancelled = true; };
  }, [user?.id, weekStart]);

  return useMemo(() => {
    const weekTrials = trials.filter((t) => {
      const d = new Date(t.date);
      return d >= weekStart && d <= weekEnd;
    });

    const totalQuestions = logs.reduce((s, l) => s + (l.question_count || 0), 0);
    const totalMinutes = logs.reduce((s, l) => s + (l.duration_minutes || 0), 0);

    const days = new Set(logs.map((l) => l.study_date));
    const activeDays = days.size;

    const prevTotalQuestions = prevLogs.reduce((s, l) => s + (l.question_count || 0), 0);
    const prevTotalMinutes = prevLogs.reduce((s, l) => s + (l.duration_minutes || 0), 0);

    const weekNetAvg = weekTrials.length > 0
      ? weekTrials.reduce((s, t) => s + (t.totalNet || 0), 0) / weekTrials.length
      : 0;

    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);
    const prevWeekTrials = trials.filter((t) => {
      const d = new Date(t.date);
      return d >= prevWeekStart && d <= prevWeekEnd;
    });
    const prevWeekNetAvg = prevWeekTrials.length > 0
      ? prevWeekTrials.reduce((s, t) => s + (t.totalNet || 0), 0) / prevWeekTrials.length
      : 0;
    const netDelta = weekNetAvg - prevWeekNetAvg;

    const subjectMap = {};
    logs.forEach((l) => {
      const key = l.subject || "other";
      if (!subjectMap[key]) subjectMap[key] = { questions: 0, minutes: 0 };
      subjectMap[key].questions += l.question_count || 0;
      subjectMap[key].minutes += l.duration_minutes || 0;
    });
    const subjects = Object.entries(subjectMap)
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.questions - a.questions);

    const dayLabels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    const dailyHeatmap = dayLabels.map((label, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const dateStr = toIso(d);
      const active = days.has(dateStr);
      const q = logs.filter((l) => l.study_date === dateStr)
        .reduce((s, l) => s + (l.question_count || 0), 0);
      return { label, date: dateStr, active, questions: q };
    });

    return {
      totalQuestions,
      totalMinutes,
      activeDays,
      trialCount: weekTrials.length,
      weekNetAvg: weekNetAvg.toFixed(1),
      netDelta: netDelta.toFixed(1),
      hasPrev: prevWeekTrials.length > 0 || prevLogs.length > 0,
      prevTotalQuestions,
      prevTotalMinutes,
      questionsDelta: totalQuestions - prevTotalQuestions,
      minutesDelta: totalMinutes - prevTotalMinutes,
      subjects,
      dailyHeatmap,
    };
  }, [logs, prevLogs, trials, weekStart, weekEnd]);
}
