import { useCallback, useMemo, useState } from "react";
import { useStudyRoute } from "./useStudyRoute";
import { ROUTE_STOP_STATUS } from "../domain/route/stopStatus";
import { subjectPaletteKey } from "../themes/subjectPalette";

const fmtHours = (minutes) => {
  const h = (Number(minutes) || 0) / 60;
  if (h >= 10) return String(Math.round(h));
  return (Math.round(h * 10) / 10).toString().replace(".", ",");
};

/**
 * KONU BORCU — atlanmis duraklar ve bunlarin saat karsiligi.
 *
 * Toplam borc `computeDebt` ciktisindan gelir (haftalik plan/gerceklesen
 * farki, eskidikce degersizlesen). Listedeki tek tek duraklar ise rotanin
 * kendisinden: yasam dongusu "skipped" olan duraklar.
 *
 * "Dagit" = atlanan duragi RESCHEDULED'a tasimak. Bu, stopStatus'taki
 * gecerli bir gecis ve sunucuda kaliciliyor -- ekranda gosterip
 * kaydetmeyen sahte bir buton degil.
 */
export function useTopicDebt() {
  const { route, debt, debtWeeks, transitionStop } = useStudyRoute();
  const [distributing, setDistributing] = useState(false);
  const [error, setError] = useState(null);

  const stops = useMemo(() => {
    const out = [];
    (route?.weeks || []).forEach((week) => {
      (week.stops || []).forEach((stop) => {
        if (stop.lifecycleStatus !== ROUTE_STOP_STATUS.SKIPPED) return;
        const minutes = Number(stop.cost?.minutes) || 0;
        out.push({
          key: stop.logicalStopKey,
          stop,
          subject: stop.subjectLabel || stop.subject,
          subjectKey: subjectPaletteKey(stop.subject),
          title: `${stop.subjectLabel || stop.subject} · ${stop.topic}`,
          hours: fmtHours(minutes),
          minutes,
        });
      });
    });
    return out.sort((a, b) => b.minutes - a.minutes);
  }, [route]);

  // Yalniz kalici (stopId'si olan) duraklar tasinabilir.
  const movable = useMemo(() => stops.filter((s) => s.stop.stopId), [stops]);

  const distribute = useCallback(async () => {
    if (!movable.length || distributing) return;
    setDistributing(true);
    setError(null);
    try {
      for (const item of movable) {
        await transitionStop(item.stop, ROUTE_STOP_STATUS.RESCHEDULED, { source: "topic_debt" });
      }
    } catch (e) {
      setError(e);
    } finally {
      setDistributing(false);
    }
  }, [movable, distributing, transitionStop]);

  return {
    stops,
    stopCount: stops.length,
    totalHours: fmtHours(debt?.totalMinutes),
    hasHours: (debt?.totalMinutes || 0) > 0,
    debtWeeks,
    capped: Boolean(debt?.capped),
    canDistribute: movable.length > 0,
    distributing,
    error,
    distribute,
    isEmpty: stops.length === 0 && !(debt?.hasDebt),
  };
}
