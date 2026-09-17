import { useMemo } from "react";
import { useSelector } from "react-redux";

import { selectTodayLogs, selectStreak, selectLastStudyDate } from "../store/slices/studyLogSlice";
import { selectTrials } from "../store/slices/trialSlice";
import { useC } from "../contexts/ThemeContext";
import { usePremium } from "../contexts/PremiumContext";
import { useSync } from "../contexts/DataSyncContext";
import { useStudyRoute } from "./useStudyRoute";
import { useSummaryLogs } from "./useSummaryLogs";
import { dateKey } from "../lib/dateUtils";
import { getAllSubjects } from "../domain/trial/trialTypes";
import { rangeHeaderLabel, resolveSummaryRange } from "../domain/summary/periodRange";
import { toKey } from "../domain/summary/dateKeys";
import { buildWeekSummary, buildRecentDays } from "../domain/summary/weekSummary";
import { buildMonthSummary } from "../domain/summary/monthSummary";
import { buildDaySummary } from "../domain/summary/daySummary";

// Aylik rapor Pro (paywallContexts.monthly_report). Gun ve hafta ozeti acik:
// "Kısa haftalık özet her pazar gelir · Günlük özet ve rota göstergeleri açık".
const MONTH_FEATURE = "advanced_reports";

export function useSummary(period = "day") {
  const C = useC();
  const todayLogs = useSelector(selectTodayLogs);
  const streak = useSelector(selectStreak);
  const lastStudyDate = useSelector(selectLastStudyDate);
  const trials = useSelector(selectTrials);
  const { checkFeature, accessLoading } = usePremium();
  const { syncedOnce } = useSync();
  const { route, totals, hasRouteAccess } = useStudyRoute({ persist: false });

  const todayKey = dateKey(new Date());
  const range = useMemo(() => resolveSummaryRange(period, todayKey), [period, todayKey]);
  const locked = period === "month" && !accessLoading && !checkFeature(MONTH_FEATURE);

  const routeWeeks = useMemo(() => (route?.weeks || []).map((week) => ({
    ...week,
    stops: (week.stops || []).map((stop) => ({
      ...stop,
      completedKey: stop.completedAt ? dateKey(new Date(stop.completedAt)) : null,
    })),
  })), [route?.weeks]);

  const routeStart = toKey(routeWeeks[0]?.weekStart);
  const from = period === "week" && routeStart && routeStart < range.prevStart ? routeStart : range.prevStart;
  const logsState = useSummaryLogs(from, range.end, !locked);

  return useMemo(() => {
    const base = {
      period: range.period,
      locked,
      headerLabel: rangeHeaderLabel(range),
      loading: !syncedOnce
        || (range.period !== "day" && logsState.loading)
        || (range.period === "month" && accessLoading),
      error: logsState.error,
      retry: logsState.retry,
      streak,
    };
    if (locked) return base;

    if (range.period === "week") {
      return { ...base, ...buildWeekSummary({ range, logs: logsState.logs, routeWeeks }) };
    }
    if (range.period === "month") {
      const subjectMeta = Object.fromEntries(getAllSubjects(C).map((s) => [s.key, s]));
      return {
        ...base,
        ...buildMonthSummary({ range, logs: logsState.logs, trials, routeWeeks, streak, lastStudyDate, subjectMeta }),
      };
    }
    return {
      ...base,
      ...buildDaySummary({ todayKey, todayLogs, streak, routeWeeks, totals, hasRouteAccess }),
      recent: logsState.loading ? null : buildRecentDays({ range, logs: logsState.logs }),
    };
  }, [range, locked, logsState, period, accessLoading, syncedOnce, streak, routeWeeks, C, trials, lastStudyDate,
    todayKey, todayLogs, totals, hasRouteAccess]);
}
