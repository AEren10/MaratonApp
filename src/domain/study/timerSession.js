import { getJson, setJson, remove } from "../../lib/storage/appStorage";
import { STORAGE_KEYS } from "../../constants/storageKeys";

// KRONOMETRE OTURUMUNUN KURTARILMASI
//
// İki ayrı hata vardı:
//
// 1) SÜRE YANLIŞ SAYILIYORDU. Sayaç `setInterval` ile her tick'te elapsed+1
//    yapıyordu. JS zamanlayıcıları uygulama arka plandayken kısılır ya da
//    tamamen durur — 45 dakika çalışan öğrenci 12 dakika kaydediyordu.
//    Çözüm: geçen süreyi tick sayısıyla değil DUVAR SAATİYLE hesapla.
//
// 2) OTURUM KAYBOLUYORDU. Tüm durum yalnızca useState'teydi. iOS'ta arka
//    plandaki uygulamayı sistem rutin olarak öldürür; dönen kullanıcı sayacı
//    00:00 buluyordu. 90 dakikalık emek, hiçbir uyarı olmadan yok.
//    Çözüm: çalışırken anlık görüntüyü diske yaz, açılışta sor.

const KEY = STORAGE_KEYS.ACTIVE_TIMER_SESSION;

// Bundan eski bir oturum kurtarılmaz — kullanıcı büyük ihtimalle unutmuştur
// ve "6 saat önce başladığın oturum" diye sormak saçma olur.
export const MAX_RECOVERY_AGE_MS = 6 * 60 * 60 * 1000;

/**
 * Duvar saatiyle geçen süre.
 *
 * @param accumulated  duraklatmalardan önce biriken saniye
 * @param startedAt    en son "başlat"a basıldığı an (ms), duraklıysa null
 */
export function elapsedFrom(accumulated = 0, startedAt = null, now = Date.now()) {
  if (!startedAt) return Math.max(0, Math.round(accumulated));
  return Math.max(0, Math.round(accumulated + (now - startedAt) / 1000));
}

/** Çalışan oturumun anlık görüntüsünü diske yazar. */
export async function saveTimerSession(snapshot) {
  if (!snapshot) return;
  try {
    await setJson(KEY, { ...snapshot, savedAt: Date.now() });
  } catch (_) {}
}

export async function clearTimerSession() {
  try { await remove(KEY); } catch (_) {}
}

/**
 * Kurtarılabilir oturum var mı.
 * @returns { session, ageMs, recoverable } | null
 */
export async function loadTimerSession() {
  try {
    const s = await getJson(KEY, null);
    if (!s || !s.savedAt) return null;

    const ageMs = Date.now() - s.savedAt;
    if (ageMs > MAX_RECOVERY_AGE_MS) {
      await clearTimerSession();
      return null;
    }

    // Kaydedildiği anda ÇALIŞIYORDUYSA, uygulamanın kapalı geçtiği süre de
    // sayılmalı — öğrenci telefonu kilitleyip çalışmaya devam etmiş olabilir.
    // Ama sınırsız değil: makul bir tavan koyuyoruz ki uygulama üç gün kapalı
    // kaldıysa "3 gün çalıştın" demeyelim.
    const wasRunning = !!s.startedAt;
    const elapsed = wasRunning
      ? elapsedFrom(s.accumulated, s.startedAt, Math.min(Date.now(), s.savedAt + MAX_RECOVERY_AGE_MS))
      : Math.round(s.accumulated || 0);

    return {
      session: { ...s, recoveredElapsed: elapsed },
      ageMs,
      // Anlamlı bir süre yoksa sormaya değmez.
      recoverable: elapsed >= 60,
    };
  } catch (_) {
    return null;
  }
}

/**
 * Oturumu "kayıt ekranına devredildi" diye işaretler ama SİLMEZ.
 *
 * Eskiden kronometre bitince clearTimerSession() çağrılıp kayıt ekranına
 * geçiliyordu. Kullanıcı o ekrandan geri çıkarsa ya da sistem uygulamayı
 * öldürürse 50 dakikalık oturum, soru ve doğru sayıları KALICI olarak
 * kayboluyordu — hiçbir uyarı da yoktu.
 *
 * Artık anlık görüntü duruyor; yalnızca kayıt gerçekten başarılı olunca
 * (ya da kullanıcı bilerek vazgeçince) siliniyor.
 */
export async function markTimerSessionPendingSave(payload) {
  try {
    const s = await getJson(KEY, null);
    await setJson(KEY, {
      ...(s || {}),
      ...(payload || {}),
      pendingSave: true,
      startedAt: null,
      savedAt: Date.now(),
    });
  } catch (_) {}
}

/** Kurtarma sorusu için insan diliyle süre. */
export function describeRecovery(session) {
  const sec = session?.recoveredElapsed || 0;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} dakikalık`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} saat ${m} dakikalık` : `${h} saatlik`;
}
