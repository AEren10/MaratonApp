import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { removeTrial, restoreTrial } from "../../store/slices/trialSlice";
import { deleteTrial } from "../../supabase/trials";
import { removeFromQueue } from "../../lib/offlineQueue";
import * as H from "../../lib/haptics";

// "..." menüsü: paylaş / sil. İş mantığı ekran dosyasından buraya taşındı.
export function useTrialDetailMenu({ latest, user, navigation, showAlert, cardRef }) {
  const dispatch = useDispatch();

  const handleShare = useCallback(async () => {
    H.tap();
    let captureRef, Sharing;
    try {
      ({ captureRef } = require("react-native-view-shot"));
      Sharing = require("expo-sharing");
    } catch {
      showAlert("Paylaşım kullanılamıyor", "Bu özellik için güncel uygulama derlemesi gerekiyor.");
      return;
    }
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      if (!(await Sharing.isAvailableAsync())) {
        showAlert("Paylaşım yok", "Bu cihazda paylaşım kullanılamıyor.");
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Deneme karneni paylaş" });
    } catch {
      showAlert("Hata", "Karne oluşturulamadı, tekrar dene.");
    }
  }, [cardRef, showAlert]);

  const handleDelete = useCallback(() => {
    if (!latest?.id || !user?.id) return;
    const snapshot = latest;
    dispatch(removeTrial(latest.id));
    navigation.goBack();
    (async () => {
      try {
        if (snapshot.pending) await removeFromQueue(snapshot.id);
        else await deleteTrial(snapshot.id, user.id);
      } catch {
        dispatch(restoreTrial(snapshot));
        showAlert("Silinemedi", "Deneme silinemedi, geri alındı. Bağlantını kontrol et.");
      }
    })();
  }, [latest, user?.id, dispatch, navigation, showAlert]);

  const handleMenu = useCallback(() => {
    showAlert(latest?.name || "Deneme", null, [
      { text: "Paylaş", onPress: handleShare },
      { text: "Sil", style: "destructive", onPress: handleDelete },
      { text: "Vazgeç", style: "cancel" },
    ]);
  }, [latest, showAlert, handleShare, handleDelete]);

  return { handleMenu };
}
