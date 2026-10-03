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
import { useForecastTarget } from "./useForecastTarget";
import { baselineTarget } from "../domain/forecast/forecastTarget";
import { buildNetChart, NET_CHART_LIMIT_DETAIL } from "../domain/route/netChartData";

// Rota Detay ekraninin tum verisi ve aksiyonlari. Ekran yalniz render eder.
export function useRouteDetail() {
  const navigation = useNavigation();
  const { examType, targetNet: targetSum, targetNetTYT, baselineNet, examDate } = useExam();
  const { accessLoading, accessError, accessSnapshot, showPaywall } = usePremium();
  const { open: openScenarioGate } = useFeatureEntry(PRODUCT_FEATURES.route_scenarios, "route_scenarios");
  const route = useStudyRoute({ persist: false });
  const {
    weeks, daysLeft, forecast, forecastTypes, forecastTrials, tempoScenarios, isPaused, routeCreated, routeCreating, createRoute,
  } = route;
  // Tahmin tek sinavin denemelerinden; kiyas o sinavin hedefiyle (TYT+AYT
  // toplami ile degil). Baslangic cizgisi TYT seviye testinden, hedefi TYT.
  const { target: targetNet, label: examLabel } = useForecastTarget(forecastTypes);
  const startGoal = baselineTarget({ examType, targetNet: targetSum, targetNetTYT }).target;

  const flat = useMemo(() => flattenRouteStops(weeks, { routeFrozen: isPaused }), [weeks, isPaused]);
  const upcoming = useMemo(() => upcomingRouteStops(flat, 3).map((item) => ({
    key: item.key,
    name: item.stop.topic,
    note: item.stop.subjectLabel || null,
    date: routeDateTag(item.weekStart),
  })), [flat]);
  const view = useMemo(
    () => routeDetailForecast({
      forecast, targetNet, tempoScenarios,
      netChart: buildNetChart({
        trials: forecastTrials, types: forecastTypes, forecast, target: targetNet, limit: NET_CHART_LIMIT_DETAIL,
      }),
    }),
    [forecast, targetNet, tempoScenarios, forecastTrials, forecastTypes],
  );
  const promise = useMemo(() => buildPlanVsActual(weeks), [weeks]);

  // Olculmus tahmin yokken bile kullanicinin KENDI beyani var: kurulumda
  // girdigi baslangic ve hedef net. Ekran bunlari geri soylemek yerine
  // "HENUZ TAHMIN YOK" yaziyordu.
  const declared = useMemo(
    () => routeDeclaredPath({ baselineNet, targetNet: startGoal, daysLeft, stopCount: flat.length }),
    [baselineNet, startGoal, daysLeft, flat.length],
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
    isLGS: String(examType || "").toLowerCase() === "lgs",
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
    examLabel,
    view,
    declared,
    scenariosLocked: !scenariosOpen,
    promiseText: promise.hasData ? `Planlanan ${promise.plannedDue}, tamamlanan ${promise.doneDue} durak` : null,
    upcoming,
    addFirstStop,
    openScenarios,
    // Bagla acildiysa geri gidecek ekran olmayabilir: ana sayfaya don.
    goBack: () => (navigation.canGoBack() ? navigation.goBack() : openInTab(navigation, TAB_KEYS.ROTA, SCREENS.HOME)),
    openThreshold: () => openInTab(navigation, TAB_KEYS.ROTA, SCREENS.RANK_SIMULATOR),
    openHowItWorks: () => navigation.navigate(SCREENS.HOW_IT_WORKS),
    openStop: (key) => openInTab(navigation, TAB_KEYS.ROTA, SCREENS.ROUTE_STOP_DETAIL, { stopKey: key }),
  };
}
