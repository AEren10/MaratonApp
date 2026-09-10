import { useMemo } from "react";
import { useSelector } from "react-redux";

import { selectTodayLogs, selectStreak } from "../store/slices/studyLogSlice";
import { useWeeklyReport } from "./useWeeklyReport";
import { useStudyRoute } from "./useStudyRoute";
import { ROUTE_STOP_STATUS } from "../domain/route/stopStatus";
import { dateKey } from "../lib/dateUtils";

const DAY_LABELS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const MONTH_LABELS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m}dk`;
  return `${h}sa ${String(m).padStart(2, "0")}`;
}

function formatDateLabel(date) {
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]} · ${DAY_LABELS[date.getDay()]}`;
}

// Gün modu: gercek veriye baglanir (studyLog + useWeeklyReport + useStudyRoute).
// Hafta/ay modu: iskelet — veri kaynagi bu turda baglanmadi, cagiran taraf
// `ready` alanina bakip bos durum gostermeli.
export function useSummary(period = "day") {
  const todayLogs = useSelector(selectTodayLogs);
  const streak = useSelector(selectStreak);
  const weekly = useWeeklyReport();
  const { route, totals, hasRouteAccess } = useStudyRoute({ persist: false });

  return useMemo(() => {
    const now = new Date();
    const dateLabel = formatDateLabel(now);

    if (period !== "day") {
      // DOĞRULANMADI: hafta/ay dönemleri için veri kaynağı henüz bağlanmadı.
      return {
        period,
        ready: false,
        dateLabel,
      };
    }

    const todayKey = dateKey(new Date());
    const totalQuestions = todayLogs.reduce((s, l) => s + (l.questionCount || 0), 0);
    const totalMinutes = todayLogs.reduce((s, l) => s + (l.duration || 0), 0);
    // BUGUN TAMAMLANAN DURAK. Tasarim bu sayiyi "DURAK" diye gosteriyor.
    // Ilk uygulama bugun calisilan farkli DERS sayisini koyuyordu — baska
    // bir kavram. Gercek deger duraklardan geliyor: lifecycleStatus
    // "completed" olan ve son guncellemesi BUGUN olan duraklar.
    // (useStudyRoute duragin updated_at'ini completedAt olarak tasiyor;
    //  tamamlanmis bir durak icin son guncelleme pratikte tamamlanma anidir.)
    const stopsToday = (route?.weeks || []).reduce((count, week) => count + (week.stops || []).filter(
      (stop) => stop.lifecycleStatus === ROUTE_STOP_STATUS.COMPLETED
        && stop.completedAt
        && dateKey(new Date(stop.completedAt)) === todayKey,
    ).length, 0);

    const tasks = [...todayLogs]
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .map((l, i) => ({
        key: l.id != null ? String(l.id) : `${l.subject}-${i}`,
        subject: l.subject,
        topic: l.topic,
        duration: l.duration || 0,
        questionCount: l.questionCount || 0,
      }));

    const hasData = todayLogs.length > 0;
    const weeklyBars = weekly.loading ? [] : weekly.dailyHeatmap;
    const questionsDeltaPct = weekly.prevTotalQuestions > 0
      ? Math.round(((weekly.totalQuestions - weekly.prevTotalQuestions) / weekly.prevTotalQuestions) * 100)
      : null;

    const routeImpact = hasRouteAccess && totals
      ? {
          progressPct: Math.round((totals.progress || 0) * 100),
          remainingQuestions: totals.remainingQuestions ?? null,
        }
      : null;

    return {
      period,
      ready: true,
      hasData,
      dateLabel,
      headline: `${stopsToday} durak geçtin, seri ${streak} güne çıktı.`,
      totalQuestions,
      totalMinutes,
      durationLabel: formatDuration(totalMinutes),
      stopsToday,
      streak,
      tasks,
      weeklyBars,
      weeklyLoading: weekly.loading,
      questionsDeltaPct,
      routeImpact,
      ctaLabel: "Yarının planına bak",
      shareLabel: "Kartı paylaş",
    };
  }, [period, todayLogs, streak, weekly, totals, hasRouteAccess]);
}
