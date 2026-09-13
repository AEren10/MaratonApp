import { useMemo } from "react";

import { getAllSubjects } from "../domain/trial/trialTypes";
import { generateDailyPlan } from "../lib/planEngine";
import { useStudyRoute } from "./useStudyRoute";
import { useHomeWeekLogs } from "./useHomeWeekLogs";
import { displayNameOf } from "../lib/displayName";
import { useRehearsalToday } from "./useRehearsalToday";

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
    .map(([key, nets]) => {
      const subject = allSubjects.find((item) => item.key === key);
      const current = nets[nets.length - 1];
      const previous = nets[nets.length - 2];
      return {
        key,
        name: subject?.name || key,
        color: subject?.color || C.accent,
        nets,
        currentNet: current,
        delta: current - previous,
      };
    })
    // "DİKKAT ÇEKEN İKİ DERS": son iki deneme arasinda en cok oynayan dersler.
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 2);
}

export function useHomeDashboard({ C, planCtx, todayLogs, trials, user }) {
  // Ana sayfa rotanın SAHİBİ: rota burada çiziliyor ve kalıcılaştırılıyor
  // (route_weeks). Diğer ekranlar persist:false ile sadece okuyor, böylece
  // aynı hafta iki yerden yazılmıyor.
  const {
    currentWeek: routeCurrentWeek, totals: routeTotals, daysLeft, transitionStop,
  } = useStudyRoute();
  const rehearsalToday = useRehearsalToday(user?.id);

  const displayName = displayNameOf(user);
  const { weeklyActivity, weekLogs, loaded: weekLoaded, failed: weekFailed } = useHomeWeekLogs({ todayLogs, userId: user?.id });

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
    // Deneme provasi gunu: "O gün başka durak açılmaz" (AKIS 14).
    const generated = rehearsalToday
      ? { tasks: [], totalQuestions: 0, estimatedMinutes: 0 }
      : generateDailyPlan({ ...planCtx, routeWeekStops: routeCurrentWeek?.stops || [] });
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
  }, [planCtx, solvedToday, routeCurrentWeek, rehearsalToday]);

  const subjectMomentum = useMemo(
    () => buildSubjectMomentum(trials, C),
    [C, trials],
  );

  return {
    daysLeft,
    displayName,
    generatedTasks,
    minutesToday,
    plan,
    routeCurrentWeek,
    routeTotals,
    solvedToday,
    subjectMomentum,
    transitionStop,
    weeklyActivity,
    weekFailed,
    weekLoaded,
    weekLogs,
  };
}
