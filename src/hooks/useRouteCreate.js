import { useCallback } from "react";

import { useAlert } from "../contexts/AlertContext";
import { firstRouteAction } from "../domain/route/routeStartAction";
import * as H from "../lib/haptics";
import { showRouteCreatedAlert } from "../screens/roadmap/routeCreatedAlert";

// Rotayi ciz / yeniden ciz aksiyonu. Eskiden Rota Detay'daki onay
// diyaloglarinin icindeydi (useRoadmapConfirmations); tam ekran Rotayi
// Yeniden Ciz ve Bos Rota ayni cagriyi paylasiyor. Davranis birebir ayni:
// createRoute -> basari haptigi -> "rota olustu" uyarisi + ilk durak teklifi.
export function useRouteCreate({ createRoute, routeCreated, navigation }) {
  const showAlert = useAlert();

  return useCallback(async ({ onDone } = {}) => {
    try {
      const result = await createRoute();
      const nextAction = firstRouteAction(result?.stops);
      H.success();
      onDone?.();
      showRouteCreatedAlert({
        action: nextAction,
        navigation,
        revisionSummary: result?.revisionSummary,
        routeCreated,
        showAlert,
      });
      return true;
    } catch {
      H.error();
      showAlert("Rota oluşturulamadı", "Bağlantını kontrol edip tekrar dene. Önizlemen kaybolmadı.");
      return false;
    }
  }, [createRoute, navigation, routeCreated, showAlert]);
}
