import { SCREENS } from "../../constants/screens";
import { EVENTS } from "../../constants/analytics";
import { routeActionTimerParams } from "../../domain/route/routeStartAction";
import { buildRouteCreatedAlertCopy } from "../../domain/route/routeCreatedAlertCopy";
import { track } from "../../lib/analytics";

export function showRouteCreatedAlert({ action, navigation, routeCreated, revisionSummary, showAlert }) {
  const copy = buildRouteCreatedAlertCopy({ action, routeCreated, revisionSummary });
  if (!action) {
    showAlert(copy.title, copy.message);
    return;
  }
  track(EVENTS.ROUTE_FIRST_ACTION_OFFERED, {
    routeCreated,
    subject: action.subjectKey,
    stopId: action.stopId || null,
  });
  showAlert(copy.title, copy.message, [
    { text: "Sonra", style: "cancel" },
    {
      text: action.actionLabel,
      icon: "play",
      onPress: () => {
        track(EVENTS.ROUTE_FIRST_ACTION_STARTED, {
          subject: action.subjectKey,
          stopId: action.stopId || null,
        });
        navigation.navigate(SCREENS.STUDY_TIMER, routeActionTimerParams(action));
      },
    },
  ]);
}
