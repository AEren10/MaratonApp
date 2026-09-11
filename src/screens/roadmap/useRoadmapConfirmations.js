import { useCallback } from "react";

import { firstRouteAction } from "../../domain/route/routeStartAction";
import * as H from "../../lib/haptics";
import { showRouteCreatedAlert } from "./routeCreatedAlert";

// Rota Detay'daki iki yikici aksiyonun onay diyaloglari — kopya tasarimdan
// birebir alindi (Ara Verme / Rotayi Yeniden Ciz artboardlari).
export function useRoadmapConfirmations({
  isPaused, pause, resume, createRoute, routeCreated, navigation, showAlert,
}) {
  const togglePause = useCallback(() => {
    if (isPaused) {
      resume();
      return;
    }
    showAlert(
      "Rotayı dondurmak bırakmak değil.",
      "Rotan olduğu gibi kalır. Bildirimler durur, seri sayacı donar, hiçbir şey silinmez.",
      [
        { text: "Vazgeç, devam ediyorum", style: "cancel" },
        { text: "Rotayı dondur", icon: "pause", onPress: pause },
      ],
    );
  }, [isPaused, pause, resume, showAlert]);

  const runCreateRoute = useCallback(async () => {
    try {
      const result = await createRoute();
      const nextAction = firstRouteAction(result?.stops);
      H.success();
      showRouteCreatedAlert({
        action: nextAction,
        navigation,
        revisionSummary: result?.revisionSummary,
        routeCreated,
        showAlert,
      });
    } catch {
      H.error();
      showAlert("Rota oluşturulamadı", "Bağlantını kontrol edip tekrar dene. Önizlemen kaybolmadı.");
    }
  }, [createRoute, navigation, routeCreated, showAlert]);

  const handleCreateRoute = useCallback(() => {
    if (!routeCreated) {
      runCreateRoute();
      return;
    }
    showAlert(
      "Rota sıfırdan çizilir.",
      "Kayıtların silinmez. Değişen tek şey durak sırası ve haftalık yük dağılımı.",
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Rotayı yeniden çiz", icon: "refresh", onPress: runCreateRoute },
      ],
    );
  }, [routeCreated, runCreateRoute, showAlert]);

  return { togglePause, handleCreateRoute };
}
