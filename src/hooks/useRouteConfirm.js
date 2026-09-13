import { useCallback, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { useAlert } from "../contexts/AlertContext";
import { flattenRouteStops, routeStopCounts } from "../domain/route/routeOverview";
import * as H from "../lib/haptics";
import { useRouteCreate } from "./useRouteCreate";
import { useStudyRoute } from "./useStudyRoute";
import { useSubscriptionKeepStats } from "./useSubscriptionKeepStats";

const pick = (stats, key, label) => {
  const item = stats.find((s) => s.key === key);
  return item ? { key, value: item.value, label: label || item.label } : null;
};

// Ara Verme + Rotayi Yeniden Ciz tam ekranlarinin verisi ve aksiyonlari.
// Aksiyonlar eski onay diyaloglariyla AYNI: pause() ve createRoute().
export function useRouteConfirm() {
  const navigation = useNavigation();
  const showAlert = useAlert();
  const { weeks, pause, createRoute, routeCreated, routeCreating } = useStudyRoute({ persist: false });
  const keep = useSubscriptionKeepStats();
  const [pausing, setPausing] = useState(false);

  const counts = useMemo(() => routeStopCounts(flattenRouteStops(weeks)), [weeks]);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const frozenStats = useMemo(() => [
    pick(keep.stats, "streak"),
    counts.total ? { key: "stops", value: counts.completed, label: "durak" } : null,
    pick(keep.stats, "questions", "soru"),
  ].filter(Boolean), [counts, keep.stats]);

  const keptStats = useMemo(() => [
    pick(keep.stats, "questions"),
    pick(keep.stats, "wrongs"),
    pick(keep.stats, "streak"),
  ].filter(Boolean), [keep.stats]);

  const confirmPause = useCallback(async () => {
    if (pausing) return;
    setPausing(true);
    try {
      await pause();
      H.success();
      navigation.goBack();
    } catch {
      H.error();
      showAlert("Olmadı", "Bağlantını kontrol edip tekrar dene.");
    } finally {
      setPausing(false);
    }
  }, [navigation, pause, pausing, showAlert]);

  const runCreate = useRouteCreate({ createRoute, routeCreated, navigation });
  const confirmRedraw = useCallback(() => {
    if (routeCreating) return;
    runCreate({ onDone: goBack });
  }, [goBack, routeCreating, runCreate]);

  return {
    statsLoading: keep.loading,
    frozenStats,
    keptStats,
    remainingStops: counts.total - counts.completed,
    pausing,
    redrawing: routeCreating,
    confirmPause,
    confirmRedraw,
    goBack,
  };
}
