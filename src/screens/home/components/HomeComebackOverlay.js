import { useCallback, useMemo } from "react";
import { useIsFocused } from "@react-navigation/native";
import { SCREENS } from "../../../constants/screens";
import { trackButtonTap } from "../../../lib/analytics";
import { ComebackModal } from "../../../components/common/ComebackModal";
import { useComebackFlow } from "../../../hooks/useComebackFlow";
import { summarizeComebackStops } from "../../../domain/route/completionMoments";

// Geri donus anlari (AKIS 14) — Ana sayfada, yalniz ekran odaktayken.
// Kapatma her yolda useRetention.dismissComeback'e gider (mevcut
// "comeback_bonus" odulu ve retention olayi orada, degismedi).
export function HomeComebackOverlay({
  comeback,
  dismissComeback,
  minutesToday,
  navigation,
  routeCurrentWeek,
  routeTotals,
  solvedToday,
}) {
  const focused = useIsFocused();
  const { stage, start } = useComebackFlow({ comeback, focused, solvedToday, minutesToday });
  const { pendingStops, stopsClosedToday } = useMemo(
    () => summarizeComebackStops(routeCurrentWeek),
    [routeCurrentWeek],
  );
  const routeProgress = (routeTotals?.topics || 0) > 0 ? routeTotals.progress : null;

  const onStart = useCallback(() => {
    trackButtonTap("home_comeback_start", { targetScreen: SCREENS.STUDY_TIMER });
    start();
    navigation.navigate(SCREENS.STUDY_TIMER);
  }, [navigation, start]);

  const goPlan = useCallback((id) => {
    trackButtonTap(id, { targetScreen: SCREENS.PLAN_DETAIL });
    dismissComeback();
    navigation.navigate(SCREENS.PLAN_DETAIL);
  }, [dismissComeback, navigation]);

  return (
    <ComebackModal
      stage={stage}
      pendingStops={pendingStops}
      solvedToday={solvedToday}
      minutesToday={minutesToday}
      stopsClosedToday={stopsClosedToday}
      routeProgress={routeProgress}
      onStart={onStart}
      onPickStop={() => goPlan("home_comeback_pick_stop")}
      onNext={() => goPlan("home_comeback_next_stop")}
      onClose={dismissComeback}
    />
  );
}
