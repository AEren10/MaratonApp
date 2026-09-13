import { useCallback } from "react";

import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

// "Karti paylas": ekran disindaki TrialShareCard'i PNG'ye cevirip paylasir.
export function useTrialSummaryShare(cardRef) {
  const showAlert = useAlert();
  return useCallback(async () => {
    H.medium();
    let captureRef;
    let Sharing;
    try {
      ({ captureRef } = require("react-native-view-shot"));
      Sharing = require("expo-sharing");
    } catch {
      showAlert("Paylaşım kullanılamıyor", "Bu özellik için güncel uygulama derlemesi gerekiyor.");
      return;
    }
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      if (!(await Sharing.isAvailableAsync())) { showAlert("Paylaşım yok"); return; }
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Deneme karneni paylaş" });
    } catch {
      showAlert("Hata", "Karne oluşturulamadı.");
    }
  }, [cardRef, showAlert]);
}
