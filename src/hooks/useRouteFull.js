import { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";

import { SCREENS } from "../constants/screens";
import { usePremium } from "../contexts/PremiumContext";
import { buildPlanVsActual } from "../domain/route/planVsActual";
import { flattenRouteStops, routeProgressSegments, routeStopCounts } from "../domain/route/routeOverview";
import { useStudyRoute } from "./useStudyRoute";

// "Rotanın tamamı" ekraninin verisi: durak sayilari, cubuk seridi, borc,
// yeniden planlanan, sinava kalan gun ve gorunum satirlarinin degerleri.
export function useRouteFull() {
  const navigation = useNavigation();
  const { showPaywall } = usePremium();
  const {
    weeks, currentWeek, daysLeft, debt, isPaused,
    hasRouteAccess, routeAccessError, routeAccessLoading, refreshRouteAccess,
  } = useStudyRoute({ persist: false });

  const flat = useMemo(() => flattenRouteStops(weeks, { routeFrozen: isPaused }), [weeks, isPaused]);
  const counts = useMemo(() => routeStopCounts(flat), [flat]);
  const segments = useMemo(() => routeProgressSegments(weeks, flat), [weeks, flat]);
  const promise = useMemo(() => buildPlanVsActual(weeks), [weeks]);
  const debtHours = debt?.totalMinutes ? Math.round(debt.totalMinutes / 60) : 0;

  return {
    access: {
      loading: routeAccessLoading,
      error: routeAccessError,
      hasAccess: hasRouteAccess,
      retry: refreshRouteAccess,
      paywall: () => showPaywall("route_gate"),
    },
    counts,
    segments,
    debtHours,
    daysLeft,
    weekStops: currentWeek?.stops?.length ?? null,
    promiseGap: promise.hasData ? promise.gap : null,
    goBack: () => navigation.goBack(),
    openProgram: () => navigation.navigate(SCREENS.DAILY_PLAN),
    openDebt: () => navigation.navigate(SCREENS.TOPIC_DEBT),
    openPromise: () => navigation.navigate(SCREENS.PLAN_VS_ACTUAL),
    openRedraw: () => navigation.navigate(SCREENS.ROUTE_REDRAW),
  };
}
