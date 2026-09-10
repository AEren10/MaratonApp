import { useMemo } from "react";
import { useExam } from "../contexts/ExamContext";
import { useStudyRoute } from "./useStudyRoute";
import { getEffectiveRouteStopStatus, ROUTE_STOP_STATUS } from "../domain/route/stopStatus";

// Hero'nun ihtiyac duydugu her seyi tek yerden turetir: rota erisimi, grafik
// verisi, ozet seridi ve CTA. Ekran dosyasi sadece render eder.
export function useHomeHeroData({ solvedToday, dailyGoal, generatedTasks }) {
  const { targetNet, daysUntilExam, examType } = useExam();
  const {
    weeks,
    forecast,
    debt,
    hasRouteAccess,
    routeAccessLoading,
  } = useStudyRoute();

  const stopCounts = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const week of weeks || []) {
      for (const stop of week.stops || []) {
        total += 1;
        if (getEffectiveRouteStopStatus(stop.lifecycleStatus) === ROUTE_STOP_STATUS.COMPLETED) done += 1;
      }
    }
    return { total, done };
  }, [weeks]);

  const chartData = useMemo(() => {
    if (!forecast?.dataPoints?.length) return null;
    const stops = forecast.dataPoints.map((p) => ({
      y: p.net,
      status: ROUTE_STOP_STATUS.COMPLETED,
      label: p.dateStr,
    }));
    const todayIndex = stops.length - 1;
    const projection = Number.isFinite(forecast.projected) ? [forecast.projected] : [];
    const band = projection.length
      ? { upper: [forecast.range?.high ?? forecast.projected], lower: [forecast.range?.low ?? forecast.projected] }
      : undefined;
    return { stops, todayIndex, projection, band };
  }, [forecast]);

  const nextTask = generatedTasks?.[0] || null;
  const ctaSubtitle = nextTask
    ? `${nextTask.subjectLabel} · ${nextTask.topicLabel}${nextTask.estimatedMinutes ? ` · ${nextTask.estimatedMinutes} dk` : ""}`
    : null;

  const remainingToGoal = Math.max(0, (dailyGoal || 0) - (solvedToday || 0));

  return {
    solvedToday,
    dailyGoal,
    remainingToGoal,
    daysUntilExam,
    examType,
    targetNet,
    hasRouteAccess,
    routeAccessLoading,
    chartData,
    stopCounts,
    // Tasarim borcu SAAT gosteriyor: "12 sa borc". computeDebt artik
    // kacirilan sorunun dakika karsiligini haftanin plannedMinutes oraniyla
    // turetiyor; dakika yoksa 0 gelir ve serit borcu hic gostermez —
    // uydurma bir soru/saat orani kullanilmaz.
    debtHours: debt?.totalMinutes ? Math.round(debt.totalMinutes / 60) : 0,
    nextTask,
    ctaSubtitle,
  };
}
