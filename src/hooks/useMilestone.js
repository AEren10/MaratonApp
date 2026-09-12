import { useMemo } from "react";
import { useSelector } from "react-redux";

import { useExam } from "../contexts/ExamContext";
import { useStudyRoute } from "./useStudyRoute";
import { getEffectiveRouteStopStatus, ROUTE_STOP_STATUS } from "../domain/route/stopStatus";
import { selectStats } from "../store/slices/gamificationSlice";
import { selectLatestTrial } from "../store/slices/trialSlice";
import { formatNumber, formatDelta } from "../lib/format";

// Kilometre Tasi ekraninin tek veri kaynagi. Ekran dosyasi yalniz render eder.
//
// KACINCI DURAK: rotanin tamamlanmis duraklari sayilir. Sayim idiomu
// useHomeHeroData ile ayni (lifecycleStatus -> efektif durum). Eski
// lib/roadmapEngine.js'in yuzdelik MILESTONES dizisi KULLANILMIYOR: o dosya
// routeEngine'e devredildi ve kodda hicbir yerden cagrilmiyor.
//
// UC SAYI:
//   soru  -> gamification.stats.totalQuestions (sunucu otoriteli, profiles)
//   sure  -> gamification.stats.totalMinutes   (ayni kaynak)
//   net   -> son denemenin totalNet'i eksi seviye testi baseline'i
// Ucu de yoklugunda null doner; ekran o sayiyi hic basmaz, sifir uydurmaz.
export function useMilestone() {
  const { weeks, hasRouteAccess, routeAccessLoading, routeAccessError } = useStudyRoute({ persist: false });
  const { baselineNet } = useExam();
  const stats = useSelector(selectStats);
  const latestTrial = useSelector(selectLatestTrial);

  const stops = useMemo(() => {
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

  const questions = useMemo(() => {
    const n = Number(stats?.totalQuestions) || 0;
    return n > 0 ? formatNumber(n) : null;
  }, [stats?.totalQuestions]);

  const hours = useMemo(() => {
    const m = Number(stats?.totalMinutes) || 0;
    if (m < 60) return null;
    return `${formatNumber(Math.round(m / 60))} sa`;
  }, [stats?.totalMinutes]);

  // Net degisimi yalniz iki ucu da GERCEK oldugunda gosterilir: baseline
  // (seviye testi) ve son deneme. Biri yoksa "artis" iddiasi kurulamaz.
  const net = useMemo(() => {
    const current = Number(latestTrial?.totalNet);
    const base = Number(baselineNet);
    if (!Number.isFinite(current) || !Number.isFinite(base)) return null;
    const delta = current - base;
    return { delta, text: formatDelta(delta, 1) };
  }, [latestTrial?.totalNet, baselineNet]);

  return {
    done: stops.done,
    total: stops.total,
    questions,
    hours,
    net,
    loading: routeAccessLoading,
    accessError: routeAccessError,
    hasRouteAccess,
  };
}
