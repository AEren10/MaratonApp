import { Platform } from "react-native";
import { captureRef } from "react-native-view-shot";
import Share from "react-native-share";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";

import { STORY_SHARE, storyShareOutcome } from "../domain/share/storyShareOutcome";
import { saveCapturedStoryToGallery } from "../domain/share/gallerySave";
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
// backgroundImage: kullanicinin sectigi fotograf (iOS'ta data URI, Android'de
// dosya yolu). Verilirse Instagram onu arka plan yapar, etiket ustune biner.
export async function shareStoryToInstagram(ref, { backgroundImage = null } = {}) {
  // TEK YAKALAMA: Etiketi olculu olarak yakalar.
  const shot = await capture(ref, Platform.OS === "ios" ? "base64" : "tmpfile");
  if (!shot) return STORY_SHARE.FAILED;

  // Instagram Stories API'si dogrudan cagirilir. Fotograf secildiyse arka plan
  // olarak gonderilir; secilmediyse koyu marka zemin rengiyle sadece sticker biner.
  if (await placeStickerInStory(shot, backgroundImage)) return STORY_SHARE.PLACED;

  // Yedek yol: Yalnizca dogrudan gonderim basarisiz olursa (Instagram kurulu degilse vb.)
  // etiket panoya kopyalanir ve kamera acilir.
  const base64 = Platform.OS === "ios" ? shot : await capture(ref, "base64");
  return pasteboardFallback(base64);
}

/**
 * Etiketi Instagram'a DOGRUDAN gonderir — kullanici hicbir sey yapistirmaz.
 *
 * iOS'ta base64, Android'de dosya yolu istenir.
 * backgroundImage varsa kullanicinin fotografi arka plana yerlesir, sticker ustune biner.
 * backgroundImage yoksa Instagram story editoru koyu zemin ve sticker ile dogrudan acilir.
 */
async function placeStickerInStory(shot, backgroundImage = null) {
  try {
    if (!shot) return false;
    const sticker = Platform.OS === "ios" ? `data:image/png;base64,${shot}` : shot;

    const shareOptions = {
      social: INSTAGRAM_STORIES_SOCIAL,
      appId: INSTAGRAM_APP_ID,
      stickerImage: sticker,
      backgroundTopColor: "#1C1C23",
      backgroundBottomColor: "#1C1C23",
    };

    if (backgroundImage) {
      shareOptions.backgroundImage = backgroundImage;
    }

    await Share.shareSingle(shareOptions);
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
  return saveCapturedStoryToGallery({
    uri,
    platform: Platform.OS,
    platformVersion: Platform.Version,
    requestWritePermission: () => MediaLibrary.requestPermissionsAsync(true),
    // Expo 57'nin yeni API'si Android 11+'da scoped storage'a genis
    // galeri okuma izni olmadan yazar. Android 10 ve altinda yazma izni gerekir.
    createAsset: (localUri) => MediaLibrary.Asset.create(localUri),
  });
}

/** Etiketi seffaf PNG olarak panoya kopyalar. */
export async function copyStoryToClipboard(ref) {
  const base64 = await capture(ref, "base64");
  if (!base64) return STORY_SHARE.FAILED;
  try {
    await Clipboard.setImageAsync(base64);
    return STORY_SHARE.COPIED;
  } catch {
    return STORY_SHARE.FAILED;
  }
}

const TIKTOK_SCHEMES = [
  "tiktok://",
  "snssdk1233://",
  "snssdk1180://",
];

/** TikTok paylasimi: karti yuksek cozunurluklu olarak galeriye kaydeder, panoya kopyalar ve dogrudan TikTok'u acar. */
export async function shareStoryToTikTok(ref) {
  const base64 = await capture(ref, "base64");
  const tmpfile = await capture(ref, "tmpfile");
  if (!base64 && !tmpfile) return STORY_SHARE.FAILED;

  // 1. Galeriye yuksek cozunurluklu kaydet (film rulosunun en basina oturur)
  let saved = false;
  if (tmpfile) {
    try {
      const res = await saveCapturedStoryToGallery({
        uri: tmpfile,
        platform: Platform.OS,
        platformVersion: Platform.Version,
        requestWritePermission: () => MediaLibrary.requestPermissionsAsync(true),
        createAsset: (localUri) => MediaLibrary.Asset.create(localUri),
      });
      saved = res === STORY_SHARE.SAVED;
    } catch {}
  }

  // 2. Panoya da kopyala (TikTok icinde metin veya sticker olarak da yapistirilabilmesi icin)
  if (base64) {
    try {
      await Clipboard.setImageAsync(base64);
    } catch {}
  }

  // 3. TikTok uygulamasini dogrudan ac (Share.open sistem menusu kaldirildi,
  // cunku TikTok iOS eklentisi yetkisiz paylasimda 'Uzgunuz, bir sorun olustu' hatasi firlatir)
  let opened = false;
  for (const scheme of TIKTOK_SCHEMES) {
    try {
      await Linking.openURL(scheme);
      opened = true;
      break;
    } catch {}
  }

  return opened ? STORY_SHARE.TIKTOK_OPENED : (saved ? STORY_SHARE.SAVED : STORY_SHARE.FAILED);
}
