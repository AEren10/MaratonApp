import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

import { SCREENS } from "../constants/screens";
import { useAlert } from "../contexts/AlertContext";
import { useAuth } from "../contexts/AuthContext";
import { usePremium } from "../contexts/PremiumContext";
import { findRouteStop, flattenRouteStops, routeDateTag } from "../domain/route/routeOverview";
import { routeActionTimerParams } from "../domain/route/routeStartAction";
import { canTransitionRouteStop, ROUTE_STOP_STATUS as S } from "../domain/route/stopStatus";
import * as H from "../lib/haptics";
import { getWrongQuestions } from "../supabase/wrongQuestions";
import { useStudyRoute } from "./useStudyRoute";

const STARTABLE = new Set([S.ACTIVE, S.UPCOMING]);

// Durak Detayi: tek duragin verisi, rotadaki komsulari ve iki aksiyonu.
export function useRouteStopDetail() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { user } = useAuth();
  const showAlert = useAlert();
  const { showPaywall } = usePremium();
  const route = useStudyRoute({ persist: false });
  const { weeks, isPaused, transitionStop } = route;
  const [postponing, setPostponing] = useState(false);
  const [notebook, setNotebook] = useState(null);

  const found = useMemo(
    () => findRouteStop(flattenRouteStops(weeks, { routeFrozen: isPaused }), params?.stopKey),
    [weeks, isPaused, params?.stopKey],
  );
  const stop = found?.entry.stop || null;

  useEffect(() => {
    if (!user?.id || user.id === "dev" || !stop?.subject) return undefined;
    let cancelled = false;
    getWrongQuestions(user.id, { subject: stop.subject, resolved: false })
      .then((rows) => { if (!cancelled) setNotebook((rows || []).filter((r) => r.topic === stop.topic).length); })
      .catch(() => { if (!cancelled) setNotebook(null); });
    return () => { cancelled = true; };
  }, [user?.id, stop?.subject, stop?.topic]);

  const start = useCallback(() => {
    if (!stop) return;
    navigation.navigate(SCREENS.STUDY_TIMER, routeActionTimerParams({
      subjectKey: stop.subject, topicName: stop.topic, stopId: stop.stopId, version: stop.version,
      stopNumber: found?.entry.number,
    }));
  }, [found?.entry.number, navigation, stop]);

  const canPostpone = Boolean(stop?.stopId && canTransitionRouteStop(found?.entry.status, S.RESCHEDULED));
  const postpone = useCallback(async () => {
    if (!canPostpone || postponing) return;
    setPostponing(true);
    try {
      await transitionStop(stop, S.RESCHEDULED, { source: "stop_detail" });
      H.success();
      navigation.goBack();
    } catch {
      H.error();
      showAlert("Olmadı", "Bağlantını kontrol edip tekrar dene.");
    } finally {
      setPostponing(false);
    }
  }, [canPostpone, navigation, postponing, showAlert, stop, transitionStop]);

  const openMore = useCallback(() => {
    showAlert(stop?.topic || "Durak", null, [
      { text: "Vazgeç", style: "cancel" },
      { text: "Rotayı dondur", icon: "pause", onPress: () => navigation.navigate(SCREENS.ROUTE_PAUSE) },
    ]);
  }, [navigation, showAlert, stop?.topic]);

  const neighbour = (item) => (item ? {
    number: item.number,
    topic: item.stop.topic,
    status: item.status,
    date: routeDateTag(item.weekStart),
  } : null);

  return {
    access: {
      loading: route.routeAccessLoading,
      error: route.routeAccessError,
      hasAccess: route.hasRouteAccess,
      retry: route.refreshRouteAccess,
      paywall: () => showPaywall("route_gate"),
    },
    stop,
    number: found?.entry.number ?? null,
    status: found?.entry.status ?? null,
    subjectCompleted: found?.subjectCompleted ?? 0,
    prev: neighbour(found?.prev),
    next: neighbour(found?.next),
    notebook,
    canStart: Boolean(stop && STARTABLE.has(found?.entry.status)),
    canPostpone,
    postponing,
    start,
    postpone,
    openMore: isPaused ? null : openMore,
    goBack: () => navigation.goBack(),
  };
}
