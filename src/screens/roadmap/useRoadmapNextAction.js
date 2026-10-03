import { useCallback, useMemo } from "react";

import { EVENTS } from "../../constants/analytics";
import { SCREENS } from "../../constants/screens";
import { firstRouteAction, routeActionTimerParams } from "../../domain/route/routeStartAction";
import { track } from "../../lib/analytics";

export function useRoadmapNextAction({ navigation, routeCreated, weeks }) {
  const nextRouteAction = useMemo(
    () => (routeCreated ? firstRouteAction(weeks.flatMap((week) => week.stops || [])) : null),
    [routeCreated, weeks],
  );

  const startNextRouteAction = useCallback(() => {
    if (!nextRouteAction) return;
    track(EVENTS.ROUTE_FIRST_ACTION_STARTED, {
      source: "roadmap_next_action",
      subject: nextRouteAction.subjectKey,
    });
    // replace() DEGIL: sayac kok yiginda; sekme icinden replace kok
    // yigina cikip MainTabs'in yerini aliyordu -> butun sekme durumu
    // siliniyor, sayactan geri donulecek yer kalmiyordu.
    navigation.navigate(SCREENS.STUDY_TIMER, routeActionTimerParams(nextRouteAction));
  }, [navigation, nextRouteAction]);

  return { nextRouteAction, startNextRouteAction };
}
