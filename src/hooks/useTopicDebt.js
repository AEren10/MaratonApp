import { useCallback, useMemo, useState } from "react";
import { useStudyRoute } from "./useStudyRoute";
import { ROUTE_STOP_STATUS } from "../domain/route/stopStatus";
import { overdueStops } from "../domain/route/overdueStops";
import { distributeDebt } from "../lib/routeEngine";
import { buildDebtDistributionView } from "../domain/route/debtDistributionView";
import { startOfWeekTR, dateKey } from "../lib/dateUtils";

const WEEK_MS = 7 * 86400000;
const MIN_PER_QUESTION = 1.5;

const fmtHours = (minutes) => {
  const h = (Number(minutes) || 0) / 60;
  if (h >= 10) return String(Math.round(h));
  return (Math.round(h * 10) / 10).toString().replace(".", ",");
};

/**
 * GERIDE KALAN KONULAR — durak bazinda (bkz. domain/route/overdueStops).
 * Ekrandaki saat, liste ve dagitim AYNI kaynaktan: bitmis haftalarin
 * tamamlanmamis, sonradan da calisilmamis duraklari. Eskiden saat haftalik
 * toplamdan, liste yalniz "atlandi" duraklardan geliyordu ("0,8 sa · 0 durak").
 *
 * "Dagit" = duraklari RESCHEDULED'a tasimak (sunucuda kalici gecis).
 */
export function useTopicDebt() {
  const { route, recentLogs, transitionStop, routeStopsLoaded, pastStops } = useStudyRoute();
  const [distributing, setDistributing] = useState(false);
  const [error, setError] = useState(null);
  const minutesPerWeek = route?.capacity?.minutesPerWeek || 0;
  // Karsilastirma DUZ tarihle: startOfWeekTR "YYYY-MM-DDT00:00:00+03:00"
  // donduruyor; metin karsilastirmasinda bu haftanin duraklari "gecmis"
  // sayiliyor, borc ekrani bu haftanin acik duraklarini gosteriyordu.
  const thisMonday = dateKey(startOfWeekTR(new Date()));

  // Gecmis haftalar en son revizyonda yok; useStudyRoute eski
  // revizyonlardan okuyor (pastStops).
  const overdue = useMemo(() => overdueStops({
    stops: pastStops, logs: recentLogs, thisMonday, minutesPerWeek,
  }), [pastStops, recentLogs, thisMonday, minutesPerWeek]);

  const stops = useMemo(() => overdue.items.map((it) => ({
    key: it.key,
    stop: { topic: it.topic },
    ids: it.stops.map((s) => s.id).filter(Boolean),
    raw: it.stops,
    subject: it.subject,
    subjectKey: it.subjectKey,
    title: `${it.subject} · ${it.topic}`,
    hours: fmtHours(it.minutes),
    minutes: it.minutes,
    statusLabel: it.skipped ? "atlandı" : `${it.ageDays === 0 ? "geçen hafta" : `${it.ageDays} gündür`}`,
  })), [overdue]);

  // Dagitim onizlemesi: siradaki uc haftaya, kapasiteyi asmadan.
  const preview = useMemo(() => {
    if (!(overdue.totalMinutes > 0)) return null;
    const now = Date.now();
    const upcoming = (route?.weeks || [])
      .filter((w) => !w.weekStart || new Date(w.weekStart).getTime() + WEEK_MS > now)
      .slice(0, 3);
    if (!upcoming.length) return null;
    const questions = Math.round(overdue.totalMinutes / MIN_PER_QUESTION);
    return buildDebtDistributionView({
      distribution: distributeDebt(questions, upcoming, route?.capacity),
      debt: { totalQuestions: questions, totalMinutes: overdue.totalMinutes },
      stops,
    });
  }, [overdue, route, stops]);

  const distribute = useCallback(async () => {
    if (!stops.length || distributing) return false;
    setDistributing(true);
    setError(null);
    try {
      for (const item of stops) {
        for (const raw of item.raw) {
          if (!raw.id) continue;
          await transitionStop({ stopId: raw.id, version: raw.version, subject: raw.subject,
            logicalStopKey: raw.logical_key, lifecycleStatus: raw.lifecycle_status },
          ROUTE_STOP_STATUS.RESCHEDULED, { source: "topic_debt" });
        }
      }
      return true;
    } catch (e) {
      setError(e);
      return false;
    } finally {
      setDistributing(false);
    }
  }, [stops, distributing, transitionStop]);

  return {
    stops,
    stopCount: stops.length,
    totalHours: fmtHours(overdue.totalMinutes),
    hasHours: overdue.totalMinutes > 0,
    debtWeeks: overdue.weeks,
    // Borcun haftalik kapasiteye orani: hero notu ve etki karti bunu soyler.
    weekShare: minutesPerWeek > 0 ? Math.round((overdue.totalMinutes / minutesPerWeek) * 100) : null,
    capped: overdue.capped,
    canDistribute: stops.length > 0,
    distributing,
    error,
    distribute,
    preview,
    isEmpty: stops.length === 0,
    loading: !routeStopsLoaded,
  };
}
