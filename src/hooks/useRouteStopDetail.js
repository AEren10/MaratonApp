import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

import { SCREENS } from "../constants/screens";
import { useAlert } from "../contexts/AlertContext";
import { useAuth } from "../contexts/AuthContext";
import { usePremium } from "../contexts/PremiumContext";
import { findRouteStop, flattenRouteStops, routeDateTag } from "../domain/route/routeOverview";
import { routeActionTimerParams } from "../domain/route/routeStartAction";
import { ROUTE_STOP_STATUS as S } from "../domain/route/stopStatus";
import * as H from "../lib/haptics";
import { getWrongQuestions } from "../supabase/wrongQuestions";
import { useStudyRoute } from "./useStudyRoute";
import { useStopMoves } from "./useStopMoves";
import { useClassSchedule } from "./useClassSchedule";
import { useDayPlanOptions } from "./useDayPlanOptions";
import { assignRouteStopsToDates } from "../domain/program/assignStopsToDays";
import { mondayOf } from "../domain/program/dayKeys";
import { todayTR } from "../lib/dateUtils";

const STARTABLE = new Set([S.ACTIVE, S.UPCOMING]);

// Durak Detayi: tek duragin verisi, rotadaki komsulari ve iki aksiyonu.
export function useRouteStopDetail() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { user } = useAuth();
  const showAlert = useAlert();
  const { showPaywall } = usePremium();
  const route = useStudyRoute({ persist: false });
  const { weeks, isPaused } = route;
  const { postponeStop } = useStopMoves();
  const { schedule } = useClassSchedule();
  const dayOpts = useDayPlanOptions();
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

  // "Ertele" her yerde AYNI: sonraki calisma gunune tasi (useStopMoves).
  // Eskiden burada duragi RESCHEDULED yapip listeden dusuruyordu; Program'daki
  // "Ertele" ise yalniz tasiyordu -- ayni kelime iki farkli is.
  // Ertele duragin ATANDIGI gunden sonraki gune; yalniz bu haftanin duragi.
  const assignedDate = useMemo(() => {
    if (!stop?.logicalStopKey) return null;
    const byDate = assignRouteStopsToDates(weeks || [], schedule, dayOpts);
    return Object.keys(byDate).find((d) => byDate[d].some((s) => s.logicalStopKey === stop.logicalStopKey)) || null;
  }, [weeks, schedule, dayOpts, stop?.logicalStopKey]);
  const canPostpone = Boolean(stop?.logicalStopKey)
    && [S.ACTIVE, S.UPCOMING].includes(found?.entry.status)
    && Boolean(assignedDate) && mondayOf(assignedDate) === mondayOf(todayTR());
  const postpone = useCallback(async () => {
    if (!canPostpone || postponing) return;
    setPostponing(true);
    try {
      const res = await postponeStop(stop.logicalStopKey, schedule, assignedDate);
      if (res.ok) {
        H.success();
        navigation.goBack();
      } else {
        H.warn();
        showAlert("Ertelenemedi", res.reason === "no_day"
          ? "Bu hafta başka çalışma günü yok; kalan iş sonraki haftalara yeniden planlanır."
          : "Bağlantını kontrol edip tekrar dene.");
      }
    } finally {
      setPostponing(false);
    }
  }, [canPostpone, navigation, postponing, showAlert, stop, postponeStop, schedule, assignedDate]);

  const openMore = useCallback(() => {
    showAlert(stop?.topic || "Durak", null, [
      { text: "Vazgeç", style: "cancel" },
      { text: "Rotayı dondur", icon: "pause", onPress: () => navigation.navigate(SCREENS.ROUTE_PAUSE) },
    ]);
  }, [navigation, showAlert, stop?.topic]);

  // Buyuk bir konu haftaya sigmayinca rota onu ardisik parcalara boler
  // (ayni kok, segmentIndex 0,1,2). Etiketsiz ayni konu uc kez yaziyordu;
  // parcaya ait durak "2. bölüm" diye okunur.
  const partOf = (st) => {
    if (!st || st.segmentIndex == null) return null;
    const sameRoot = stop?.rootStopKey && st.rootStopKey === stop.rootStopKey;
    return st.segmentIndex > 0 || sameRoot ? `${st.segmentIndex + 1}. bölüm` : null;
  };
  const neighbour = (item) => (item ? {
    number: item.number,
    topic: [item.stop.topic, partOf(item.stop)].filter(Boolean).join(" · "),
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
    part: partOf(stop),
    when: found?.entry.weekStart ? routeDateTag(found.entry.weekStart) : null,
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
