import { useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";

import { SCREENS } from "../constants/screens";
import { PRODUCT_FEATURES } from "../constants/premium";
import { useExam } from "../contexts/ExamContext";
import { usePremium } from "../contexts/PremiumContext";
import { canAccessProductFeature } from "../domain/premium/paywallGate";
import { buildPlanVsActual } from "../domain/route/planVsActual";
import { routeDetailForecast } from "../domain/route/routeDetailView";
import { flattenRouteStops, routeDateTag, upcomingRouteStops } from "../domain/route/routeOverview";
import { useRouteCreate } from "./useRouteCreate";
import { useStudyRoute } from "./useStudyRoute";
import { useLockedFeatureEntry } from "./useLockedFeatureEntry";

// Rota Detay ekraninin tum verisi ve aksiyonlari. Ekran yalniz render eder.
export function useRouteDetail() {
  const navigation = useNavigation();
  const { targetNet, examDate } = useExam();
  const { accessLoading, accessError, accessSnapshot, showPaywall } = usePremium();
  const enterLocked = useLockedFeatureEntry();
  const route = useStudyRoute({ persist: false });
  const {
    weeks, daysLeft, forecast, tempoScenarios, isPaused, routeCreated, routeCreating, createRoute,
  } = route;

  const flat = useMemo(() => flattenRouteStops(weeks, { routeFrozen: isPaused }), [weeks, isPaused]);
  const upcoming = useMemo(() => upcomingRouteStops(flat, 3).map((item) => ({
    key: item.key,
    name: item.stop.topic,
    note: item.stop.subjectLabel || null,
    date: routeDateTag(item.weekStart),
  })), [flat]);
  const view = useMemo(
    () => routeDetailForecast({ forecast, targetNet, tempoScenarios }),
    [forecast, targetNet, tempoScenarios],
  );
  const promise = useMemo(() => buildPlanVsActual(weeks), [weeks]);

  const scenariosOpen = canAccessProductFeature({
    accessState: accessLoading ? "loading" : accessError ? "error" : "ready",
    features: accessSnapshot?.features,
    featureKey: PRODUCT_FEATURES.route_scenarios,
  });

  const runCreate = useRouteCreate({ createRoute, routeCreated, navigation });
  const addFirstStop = useCallback(() => {
    if (weeks.length) runCreate();
    else navigation.navigate(SCREENS.ADD_TASK);
  }, [navigation, runCreate, weeks.length]);

  const openScenarios = useCallback(() => {
    if (scenariosOpen) navigation.navigate(SCREENS.NET_FORECAST);
    else enterLocked("route_scenarios");
  }, [enterLocked, navigation, scenariosOpen]);

  return {
    access: {
      loading: route.routeAccessLoading || !route.routeStopsLoaded,
      error: route.routeAccessError,
      hasAccess: route.hasRouteAccess,
      retry: route.refreshRouteAccess,
      paywall: () => showPaywall("route_gate"),
    },
    isEmpty: route.routeStopsLoaded && !routeCreated,
    creating: routeCreating,
    chartReady: Boolean(view.chart && (view.chart.stops?.length ?? 0) >= 2),
    daysLeft,
    examDateTag: routeDateTag(examDate, { withYear: true }),
    targetNet: Number.isFinite(targetNet) ? Math.round(targetNet) : null,
    view,
    scenariosLocked: !scenariosOpen,
    promiseText: promise.hasData ? `Planlanan ${promise.plannedDue}, tamamlanan ${promise.doneDue} durak` : null,
    upcoming,
    addFirstStop,
    openScenarios,
    goBack: () => navigation.goBack(),
    openThreshold: () => navigation.navigate(SCREENS.RANK_SIMULATOR),
    openPromise: () => navigation.navigate(SCREENS.PLAN_VS_ACTUAL),
    openHowItWorks: () => navigation.navigate(SCREENS.HOW_IT_WORKS),
    openStop: (key) => navigation.navigate(SCREENS.ROUTE_STOP_DETAIL, { stopKey: key }),
  };
}
