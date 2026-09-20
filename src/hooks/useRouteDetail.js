import { useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";

import { SCREENS } from "../constants/screens";
import { TAB_KEYS } from "../navigation/tabAssignment";
import { openInTab } from "../navigation/tabJump";
import { PRODUCT_FEATURES } from "../constants/premium";
import { useExam } from "../contexts/ExamContext";
import { usePremium } from "../contexts/PremiumContext";
import { canAccessProductFeature } from "../domain/premium/paywallGate";
import { buildPlanVsActual } from "../domain/route/planVsActual";
import { routeDetailForecast } from "../domain/route/routeDetailView";
import { routeDeclaredPath } from "../domain/route/declaredPath";
import { flattenRouteStops, routeDateTag, upcomingRouteStops } from "../domain/route/routeOverview";
import { useRouteCreate } from "./useRouteCreate";
import { useStudyRoute } from "./useStudyRoute";
import { useFeatureEntry } from "./useFeatureEntry";

// Rota Detay ekraninin tum verisi ve aksiyonlari. Ekran yalniz render eder.
export function useRouteDetail() {
  const navigation = useNavigation();
  const { targetNet, baselineNet, examDate } = useExam();
  const { accessLoading, accessError, accessSnapshot, showPaywall } = usePremium();
  const { open: openScenarioGate } = useFeatureEntry(PRODUCT_FEATURES.route_scenarios, "route_scenarios");
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

  // Olculmus tahmin yokken bile kullanicinin KENDI beyani var: kurulumda
  // girdigi baslangic ve hedef net. Ekran bunlari geri soylemek yerine
  // "HENUZ TAHMIN YOK" yaziyordu.
  const declared = useMemo(
    () => routeDeclaredPath({ baselineNet, targetNet, daysLeft, stopCount: flat.length }),
    [baselineNet, targetNet, daysLeft, flat.length],
  );

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

  const openScenarios = useCallback(
    () => openScenarioGate(() => openInTab(navigation, TAB_KEYS.ROTA, SCREENS.NET_FORECAST)),
    [navigation, openScenarioGate],
  );

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
    declared,
    scenariosLocked: !scenariosOpen,
    promiseText: promise.hasData ? `Planlanan ${promise.plannedDue}, tamamlanan ${promise.doneDue} durak` : null,
    upcoming,
    addFirstStop,
    openScenarios,
    goBack: () => navigation.goBack(),
    openThreshold: () => openInTab(navigation, TAB_KEYS.ROTA, SCREENS.RANK_SIMULATOR),
    openPromise: () => navigation.navigate(SCREENS.PLAN_VS_ACTUAL),
    openHowItWorks: () => navigation.navigate(SCREENS.HOW_IT_WORKS),
    openStop: (key) => openInTab(navigation, TAB_KEYS.ROTA, SCREENS.ROUTE_STOP_DETAIL, { stopKey: key }),
  };
}
