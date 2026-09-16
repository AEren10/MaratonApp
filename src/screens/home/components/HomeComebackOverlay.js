import { useCallback, useMemo } from "react";
import { SCREENS } from "../../../constants/screens";
import { trackButtonTap } from "../../../lib/analytics";
import { ComebackModal } from "../../../components/common/ComebackModal";
import { summarizeComebackStops } from "../../../domain/route/completionMoments";

// Geri donus anlari (AKIS 14) — prompt artik Ana Sayfa hero'sudur.
// Bu overlay yalniz calisma sonrasindaki "Geri döndün" kapanisini cizer;
// boylece ayni anda hem hero hem modal prompt gosterilmez.
export function HomeComebackOverlay({
  stage,
  dismissComeback,
  minutesToday,
  navigation,
  routeCurrentWeek,
  routeTotals,
  solvedToday,
}) {
  const { pendingStops, stopsClosedToday } = useMemo(
    () => summarizeComebackStops(routeCurrentWeek),
    [routeCurrentWeek],
  );
  const routeProgress = (routeTotals?.topics || 0) > 0 ? routeTotals.progress : null;

  const onStart = useCallback(() => {
    trackButtonTap("home_comeback_start", { targetScreen: SCREENS.STUDY_TIMER });
    navigation.navigate(SCREENS.STUDY_TIMER);
  }, [navigation]);

  const goPlan = useCallback((id) => {
    trackButtonTap(id, { targetScreen: SCREENS.PLAN_DETAIL });
    dismissComeback();
    navigation.navigate(SCREENS.PLAN_DETAIL);
  }, [dismissComeback, navigation]);

  return (
    <ComebackModal
      stage={stage}
      disablePrompt
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
