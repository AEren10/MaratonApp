import { useCallback } from "react";

import { useAlert } from "../contexts/AlertContext";
import { EVENTS } from "../constants/analytics";
import { track } from "../lib/analytics";
import * as H from "../lib/haptics";

// Paylasim Karti eylemleri: karti goruntuye cevirip paylas / galeriye kaydet.
export function useShareCardActions(cardRef, getShareMeta = null) {
  const showAlert = useAlert();

  const handleShare = useCallback(async () => {
    let captureRef, Sharing;
    try {
      ({ captureRef } = require("react-native-view-shot"));
      Sharing = require("expo-sharing");
    } catch {
      showAlert("Paylaşım kullanılamıyor");
      return;
    }
    try {
      H.tap();
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      if (!(await Sharing.isAvailableAsync())) { showAlert("Paylaşım yok"); return; }
      await Sharing.shareAsync(`file://${uri}`, { mimeType: "image/png", dialogTitle: "Kartını paylaş" });
      track(EVENTS.WRAPPED_SHARED, { source: "share_card", ...(getShareMeta?.() || {}) });
      H.success();
    } catch {
      showAlert("Hata", "Kart oluşturulamadı.");
    }
  }, [cardRef, getShareMeta, showAlert]);

  // Galeriye kaydet. expo-media-library kuruldu (SDK 54: ~18.2.1) ve
  // app.json'a savePhotosPermission ile eklendi, yani buton gercekten
  // calisiyor. Yalniz KAYDETME izni isteniyor ("writeOnly"): kullanicinin
  // tum galerisini okumaya gerek yok, kart yazmak yeterli.
  const handleSaveGallery = useCallback(async () => {
    try {
      const { captureRef } = require("react-native-view-shot");
      const MediaLibrary = require("expo-media-library");

      const perm = await MediaLibrary.requestPermissionsAsync(true);
      if (!perm.granted) {
        H.warn();
        showAlert("Galeri izni gerekiyor", "Kartı kaydetmek için izin vermen gerekiyor.");
        return;
      }
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      await MediaLibrary.saveToLibraryAsync(uri);
      H.success();
      showAlert("Kaydedildi", "Kart galerine kaydedildi.");
    } catch {
      H.warn();
      showAlert("Hata", "Kart kaydedilemedi.");
    }
  }, [cardRef, showAlert]);

  return { handleShare, handleSaveGallery };
}
