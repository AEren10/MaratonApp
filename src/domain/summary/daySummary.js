import { dayOfMonth, monthIndex, weekdayIndex } from "./dateKeys.js";
import { DAYS_FULL, MONTHS_UPPER, formatInt, upperTr } from "./summaryFormat.js";
import { ROUTE_STOP_STATUS } from "../route/stopStatus.js";

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m}dk`;
  return `${h}sa ${String(m).padStart(2, "0")}`;
}

function headlineForDay({ stopsToday, streak, totalQuestions, totalMinutes }) {
  if (stopsToday > 0) return `${stopsToday} durak geçtin, seri ${streak} güne çıktı.`;
  if (totalQuestions > 0 || totalMinutes > 0) return `Bugünkü çalışman kayda geçti, seri ${streak} güne çıktı.`;
  return `Bugün için özet hazır, seri ${streak} günde.`;
}

/**
 * Gunun Ozeti. Bugunun kayitlari Redux'tan (todayLogs), duraklar rotadan:
 * tamamlanma gunu bugun olan duraklar "DURAK" sayisidir.
 */
export function buildDaySummary({ todayKey, todayLogs = [], streak = 0, routeWeeks = [], totals = null, hasRouteAccess = false }) {
  const totalQuestions = todayLogs.reduce((s, l) => s + (l.questionCount || 0), 0);
  const totalMinutes = todayLogs.reduce((s, l) => s + (l.duration || 0), 0);
  const stopsToday = routeWeeks.reduce((count, week) => count + (week.stops || []).filter(
    (stop) => stop.lifecycleStatus === ROUTE_STOP_STATUS.COMPLETED && stop.completedKey === todayKey,
  ).length, 0);

  const dayLabel = `${dayOfMonth(todayKey)} ${MONTHS_UPPER[monthIndex(todayKey)]}`;
  const tasks = [...todayLogs]
    .sort((a, b) => (b.duration || 0) - (a.duration || 0))
    .map((l, i) => ({
      key: l.id != null ? String(l.id) : `${l.subject}-${i}`,
      subject: l.subject,
      topic: l.topic,
      duration: l.duration || 0,
      questionCount: l.questionCount || 0,
    }));

  return {
    period: "day",
    headerLabel: `${dayLabel} · ${upperTr(DAYS_FULL[weekdayIndex(todayKey)])}`,
    eyebrow: null,
    headline: headlineForDay({ stopsToday, streak, totalQuestions, totalMinutes }),
    hero: { value: formatInt(totalQuestions), label: `SORU · ${dayLabel}` },
    side: [
      { value: String(stopsToday), suffix: null, label: "DURAK" },
      { value: formatDuration(totalMinutes), label: "SÜRE" },
    ],
    tasks,
    routeImpact: hasRouteAccess && totals
      ? { progressPct: Math.round((totals.progress || 0) * 100), remainingQuestions: totals.remainingQuestions ?? null }
      : null,
    ledger: [`${stopsToday} durak`, `${formatInt(totalQuestions)} soru`, `seri ${streak} gün`],
    ctaLabel: "Yarının planına bak",
    hasActivity: todayLogs.length > 0 || stopsToday > 0,
  };
}
