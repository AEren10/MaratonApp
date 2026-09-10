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
      stopId: nextRouteAction.stopId || null,
    });
    navigation.navigate(SCREENS.STUDY_TIMER, routeActionTimerParams(nextRouteAction));
  }, [navigation, nextRouteAction]);

  return { nextRouteAction, startNextRouteAction };
}
