import { SCREENS } from "../../constants/screens";
import { routeActionTimerParams } from "../../domain/route/routeStartAction";

export function showRouteCreatedAlert({ action, navigation, routeCreated, showAlert }) {
  const title = routeCreated ? "Rota yeniden analiz edildi" : "Rota oluşturuldu";
  if (!action) {
    showAlert(title, "İlk hafta durakların kilitlendi. Tamamladıkların sonraki revizyonlarda korunacak.");
    return;
  }
  showAlert(title, `${action.title}\n${action.message}`, [
    { text: "Sonra", style: "cancel" },
    {
      text: action.actionLabel,
      icon: "play",
      onPress: () => navigation.navigate(SCREENS.STUDY_TIMER, routeActionTimerParams(action)),
    },
  ]);
}
