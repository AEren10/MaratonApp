import { useEffect, useMemo, useState } from "react";

import { getTier } from "../constants/league";
import { getAllSubjects } from "../domain/trial/trialTypes";
import { generateDailyPlan } from "../lib/planEngine";
import { useStudyRoute } from "./useStudyRoute";
import { getStudyLogs } from "../supabase/studyLogs";
import { dateKey } from "../lib/dateUtils";

const EMPTY_WEEKLY_ACTIVITY = { total: 0, counts: [0, 0, 0, 0, 0, 0, 0], percent: 0 };

function buildWeeklyActivityDates() {
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const prevMonday = new Date(monday);
  prevMonday.setDate(monday.getDate() - 7);

  return {
    dayOfWeek,
    from: dateKey(prevMonday),
    mondayStr: dateKey(monday),
    to: dateKey(now),
  };
}

function localWeekCounts(todayLogs, dayOfWeek) {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  todayLogs.forEach((log) => {
    counts[dayOfWeek] += log.questionCount || 0;
  });
  return counts;
}

function buildSubjectMomentum(trials, C) {
  if (trials.length < 2) return [];
  const allSubjects = getAllSubjects(C);
  const bySubject = {};

  trials.slice(0, 5).reverse().forEach((trial) => {
    Object.entries(trial.subjects || {}).forEach(([key, subject]) => {
      if (!bySubject[key]) bySubject[key] = [];
      bySubject[key].push(subject.net || 0);
    });
  });

  return Object.entries(bySubject)
    .filter(([, nets]) => nets.length >= 2)
    .slice(0, 4)
    .map(([key, nets]) => {
      const subject = allSubjects.find((item) => item.key === key);
      const current = nets[nets.length - 1];
      const previous = nets[nets.length - 2];
      return {
        name: subject?.name || key,
        color: subject?.color || C.accent,
        nets,
        currentNet: current,
        delta: current - previous,
      };
    });
}

function buildLatestTrialSummary(trials, C) {
  if (!trials.length) return { net: 0, trend: 0, bars: [] };
  const latest = trials[0];
  const previous = trials.slice(1).find((trial) => trial.trialType === latest.trialType);
  const allSubjects = getAllSubjects(C);
  const net = latest.totalNet || 0;
  const trend = previous ? net - (previous.totalNet || 0) : 0;
  const bars = Object.entries(latest.subjects || {}).slice(0, 4).map(([key, subject]) => {
    const meta = allSubjects.find((item) => item.key === key);
    return {
      c: meta?.color || C.amber,
      v: Math.min(1, Math.max(0, (subject.net || 0) / (meta?.max || 40))),
    };
  });
  return { net, trend, bars };
}

export function useHomeDashboard({ C, planCtx, todayLogs, trials, user, weeklyXP }) {
  // Ana sayfa rotanın SAHİBİ: rota burada çiziliyor ve kalıcılaştırılıyor
  // (route_weeks). Diğer ekranlar persist:false ile sadece okuyor, böylece
  // aynı hafta iki yerden yazılmıyor.
  const { currentWeek: routeCurrentWeek, transitionStop } = useStudyRoute();
  const [weeklyActivity, setWeeklyActivity] = useState(EMPTY_WEEKLY_ACTIVITY);

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Öğrenci";

  const solvedToday = useMemo(
    () => todayLogs.reduce((sum, log) => sum + (log.questionCount || 0), 0),
    [todayLogs],
  );

  const minutesToday = useMemo(
    () => todayLogs.reduce((sum, log) => sum + (log.duration || 0), 0),
    [todayLogs],
  );

  const { plan, generatedTasks } = useMemo(() => {
    // Rota bu haftaki durakları veriyorsa günlük plan onlardan türesin.
    const generated = generateDailyPlan({
      ...planCtx,
      routeWeekStops: routeCurrentWeek?.stops || [],
    });
    const estHours = generated.estimatedMinutes >= 60
      ? `~${Math.round(generated.estimatedMinutes / 60)} saat`
      : `~${generated.estimatedMinutes} dk`;

    return {
      plan: {
        total: generated.totalQuestions,
        done: solvedToday,
        dersler: generated.tasks.length,
        hours: estHours,
      },
      generatedTasks: generated.tasks,
    };
  }, [planCtx, solvedToday, routeCurrentWeek]);

  const subjectMomentum = useMemo(
    () => buildSubjectMomentum(trials, C),
    [C, trials],
  );

  const latestTrial = useMemo(
    () => buildLatestTrialSummary(trials, C),
    [C, trials],
  );

  const leagueTier = useMemo(() => getTier(weeklyXP).name, [weeklyXP]);

  useEffect(() => {
    const { dayOfWeek, from, mondayStr, to } = buildWeeklyActivityDates();
    const counts = localWeekCounts(todayLogs, dayOfWeek);

    if (!user?.id || user.id === "dev") {
      const total = counts.reduce((sum, count) => sum + count, 0);
      setWeeklyActivity({ total, counts, percent: 0 });
      return undefined;
    }

    let cancelled = false;
    getStudyLogs(user.id, { from, to }).then((logs) => {
      if (cancelled) return;
      const weekCounts = [0, 0, 0, 0, 0, 0, 0];
      let prevTotal = 0;

      (logs || []).forEach((log) => {
        const dateStr = String(log.study_date || "").slice(0, 10);
        const questionCount = log.questionCount ?? log.question_count ?? 0;
        if (dateStr < mondayStr) {
          prevTotal += questionCount;
          return;
        }
        const date = new Date(log.study_date);
        const idx = date.getDay() === 0 ? 6 : date.getDay() - 1;
        weekCounts[idx] += questionCount;
      });

      weekCounts[dayOfWeek] = Math.max(weekCounts[dayOfWeek], counts[dayOfWeek]);
      const total = weekCounts.reduce((sum, count) => sum + count, 0);
      const percent = prevTotal > 0
        ? Math.round(((total - prevTotal) / prevTotal) * 100)
        : (total > 0 ? 100 : 0);
      setWeeklyActivity({ total, counts: weekCounts, percent });
    }).catch(() => {
      const total = counts.reduce((sum, count) => sum + count, 0);
      setWeeklyActivity({ total, counts, percent: 0 });
    });

    return () => {
      cancelled = true;
    };
  }, [todayLogs, user?.id]);

  return {
    displayName,
    generatedTasks,
    latestTrial,
    leagueTier,
    minutesToday,
    plan,
    solvedToday,
    subjectMomentum,
    transitionStop,
    weeklyActivity,
  };
}
