import { SCREENS } from "../../constants/screens";
import { EVENTS } from "../../constants/analytics";
import { routeActionTimerParams } from "../../domain/route/routeStartAction";
import { track } from "../../lib/analytics";

export function showRouteCreatedAlert({ action, navigation, routeCreated, showAlert }) {
  const title = routeCreated ? "Rota yeniden analiz edildi" : "Rota oluşturuldu";
  if (!action) {
    showAlert(title, "İlk hafta durakların kilitlendi. Tamamladıkların sonraki revizyonlarda korunacak.");
    return;
  }
  track(EVENTS.ROUTE_FIRST_ACTION_OFFERED, {
    routeCreated,
    subject: action.subjectKey,
    stopId: action.stopId || null,
  });
  showAlert(title, `${action.title}\n${action.message}`, [
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
