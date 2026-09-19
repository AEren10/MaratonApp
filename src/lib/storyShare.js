import { captureRef } from "react-native-view-shot";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";

import { STORY_SHARE, storyShareOutcome } from "../domain/share/storyShareOutcome";

// Instagram'in story kamerasi. Acilamazsa (uygulama yoksa) hata firlatir;
// etiket zaten panoda oldugu icin kullanici elle de yapistirabilir.
const STORY_CAMERA_URL = "instagram://story-camera";

export { STORY_SHARE, storyShareOutcome };

async function capture(ref, result) {
  if (!ref?.current) return null;
  try {
    return await captureRef(ref, { format: "png", quality: 1, result });
  } catch {
    return null;
  }
}

/**
 * PAYLASIMIN TEK GECIS NOKTASI.
 *
 * Kademe A (bugun): etiketi panoya koyar, Instagram story kamerasini acar,
 * kullanici basili tutup yapistirir.
 *
 * Kademe B (Meta App ID alininca): Instagram'a etiket dogrudan gonderilir ve
 * yerlesmis gelir. O gun YALNIZ BU FONKSIYONUN ICI degisir — cagiran hicbir
 * yer degismez. Gerekenler: iOS'ta ozel pasteboard anahtarlari, Android'de
 * com.instagram.share.ADD_TO_STORY intent'i, ve kayitli bir Meta App ID.
 */
export async function shareStoryToInstagram(ref) {
  const base64 = await capture(ref, "base64");
  if (!base64) return STORY_SHARE.FAILED;

  let copied = false;
  try {
    await Clipboard.setImageAsync(base64);
    copied = true;
  } catch {
    copied = false;
  }
  if (!copied) return STORY_SHARE.FAILED;

  let opened = false;
  try {
    await Linking.openURL(STORY_CAMERA_URL);
    opened = true;
  } catch {
    opened = false;
  }

  return storyShareOutcome({ copied, opened });
}

/** Galeriye kaydet. Izin verilmezse kaydetmez ve bunu soyler. */
export async function saveStoryToGallery(ref) {
  const uri = await capture(ref, "tmpfile");
  if (!uri) return STORY_SHARE.FAILED;
  try {
    const { granted } = await MediaLibrary.requestPermissionsAsync();
    if (!granted) return STORY_SHARE.FAILED;
    await MediaLibrary.saveToLibraryAsync(uri);
    return STORY_SHARE.SAVED;
  } catch {
    return STORY_SHARE.FAILED;
  }
}
