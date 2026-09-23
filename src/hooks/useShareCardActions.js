import { useCallback } from "react";

import { useAlert } from "../contexts/AlertContext";
import { EVENTS } from "../constants/analytics";
import { track } from "../lib/analytics";
import { shareStoryToInstagram, STORY_SHARE } from "../lib/storyShare";
import * as H from "../lib/haptics";

// Paylasim Karti eylemleri: karti goruntuye cevirip paylas / galeriye kaydet.
export function useShareCardActions(cardRef, getShareMeta = null) {
  const showAlert = useAlert();

  const handleShare = useCallback(async () => {
    try {
      H.tap();
      const outcome = await shareStoryToInstagram(cardRef);
      if (outcome === STORY_SHARE.FAILED) {
        H.warn();
        showAlert("Paylaşım hazırlanamadı", "Kart görüntüsü oluşturulamadı. Tekrar dener misin?");
        return;
      }
      track(EVENTS.WRAPPED_SHARED, { source: "share_card", ...(getShareMeta?.() || {}) });
      H.success();
      if (outcome === STORY_SHARE.PLACED) showAlert("Instagram'a gönderildi", "Kart story editöründe hazır.");
      else if (outcome === STORY_SHARE.OPENED) showAlert("Etiket panoda", "Instagram'da basılı tutup Yapıştır'a dokun.");
      else if (outcome === STORY_SHARE.COPIED) showAlert("Etiket panoda", "Instagram'ı açıp story'ne yapıştırabilirsin.");
    } catch {
      H.warn();
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
