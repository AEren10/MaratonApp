import { Platform } from "react-native";
import { captureRef } from "react-native-view-shot";
import Share from "react-native-share";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";

import { STORY_SHARE, storyShareOutcome } from "../domain/share/storyShareOutcome";
import {
  STORY_CAPTURE_SCALE, STORY_HEIGHT, STORY_WIDTH,
} from "../domain/share/storySticker";

// Instagram'in story kamerasi. Acilamazsa (uygulama yoksa) hata firlatir;
// etiket zaten panoda oldugu icin kullanici elle de yapistirabilir.
const STORY_CAMERA_URL = "instagram://story-camera";

// Meta App ID. GIZLI DEGIL — istemci uygulamaya gomulur, Meta da boyle
// tasarlamis. Instagram "bu cagri kayitli bir uygulamadan mi geliyor" diye
// buna bakiyor; olmadan etigi sessizce reddediyor (Ocak 2023'ten beri).
const INSTAGRAM_APP_ID = "1219619257045936";

// Etiketin arkasindaki zemin. Tasarimin yuzey merdiveninden: bg -> surface.
const STORY_BG_TOP = "#26262F";
const STORY_BG_BOTTOM = "#1C1C23";
const INSTAGRAM_STORIES_FALLBACK = "instagramstories";
const INSTAGRAM_STORIES_SOCIAL = Share.Social?.INSTAGRAM_STORIES || INSTAGRAM_STORIES_FALLBACK;

export { STORY_SHARE, storyShareOutcome };

// YAKALAMA OLCULU YAPILIR.
// Olcu verilmediginde captureRef cihazin piksel oraniyla calisiyordu: 3x
// telefonda 1215x2160 PNG, base64'u birkac megabaytlik tek bir metin. Karti
// paylasmak uygulamayi cokertiyordu — iOS bellek basincinda olduruyor, dev
// client yeniden baslayip bundle aliyor. Tam olarak gorulen belirti buydu.
async function capture(ref, result) {
  if (!ref?.current) return null;
  try {
    return await captureRef(ref, {
      format: "png",
      quality: 1,
      result,
      width: STORY_WIDTH * STORY_CAPTURE_SCALE,
      height: STORY_HEIGHT * STORY_CAPTURE_SCALE,
    });
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
  // TEK YAKALAMA. Once dogrudan gonderim kendi yakalamasini yapiyor, sonra
  // basarisiz olursa pano yolu BIR DAHA yakaliyordu: iki tam boy PNG ve iki
  // base64 arka arkaya. Goruntu bir kez uretilip iki yola da veriliyor.
  const shot = await capture(ref, Platform.OS === "ios" ? "base64" : "tmpfile");
  if (!shot) return STORY_SHARE.FAILED;

  if (await placeStickerInStory(shot)) return STORY_SHARE.PLACED;
  // Pano yolu base64 ister; Android'de dosya yakalandigi icin orada bir kez
  // daha uretmek gerekiyor. Nadir yol: yalnizca dogrudan gonderim reddedilirse.
  const base64 = Platform.OS === "ios" ? shot : await capture(ref, "base64");
  return pasteboardFallback(base64);
}

/**
 * Etiketi Instagram'a DOGRUDAN gonderir — kullanici hicbir sey yapistirmaz.
 *
 * iOS'ta base64, Android'de dosya yolu isteniyor. Android'de base64
 * gondermek `enableBase64ShareAndroid` gerektiriyor, o da uygulamaya
 * WRITE_EXTERNAL_STORAGE izni ekliyor; bir paylasim ozelligi icin magaza
 * listesine hassas izin koymaya degmez.
 *
 * Instagram kurulu degilse ya da cagri reddedilirse firlatir; cagiran
 * pano yoluna duser.
 */
async function placeStickerInStory(shot) {
  try {
    if (!shot) return false;
    const sticker = Platform.OS === "ios" ? `data:image/png;base64,${shot}` : shot;

    await Share.shareSingle({
      social: INSTAGRAM_STORIES_SOCIAL,
      appId: INSTAGRAM_APP_ID,
      stickerImage: sticker,
      backgroundTopColor: STORY_BG_TOP,
      backgroundBottomColor: STORY_BG_BOTTOM,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Kademe A — hala YEDEK olarak duruyor. Meta App ID reddedilirse, Instagram
 * surumu eski ise ya da modul bir sekilde calismazsa kullanici yine
 * paylasabilsin: etiket panoya konur, story kamerasi acilir, kullanici
 * basili tutup yapistirir.
 */
async function pasteboardFallback(base64) {
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
    const { granted } = await MediaLibrary.requestPermissionsAsync(true);
    if (!granted) return STORY_SHARE.PERMISSION_DENIED;
    await MediaLibrary.saveToLibraryAsync(uri);
    return STORY_SHARE.SAVED;
  } catch {
    return STORY_SHARE.FAILED;
  }
}
