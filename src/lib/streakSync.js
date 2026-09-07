import { getStreak, touchStreak } from "../supabase/streaks";
import { computeStreakUpdate } from "./streakFreeze";
import { setJson } from "./storage/appStorage";
import { STORAGE_KEYS } from "../constants/storageKeys";

// ÇALIŞMA SONRASI SERİ GÜNCELLEMESİ
//
// Aynı blok AddStudyScreen ve StudySaveScreen içinde birebir kopyalanmıştı.
// Artık tek yerde; sunucu otoritesine geçişten sonra da tek yerden değişiyor.
//
// Önemli: current_streak'i ARTIK İSTEMCİ YAZMIYOR. computeStreakUpdate burada
// yalnızca iyimser gösterim ve joker uyarısı için kullanılıyor; kesin değer
// sunucudan dönen sonuçla değiştiriliyor.

/**
 * @returns { newStreak, usedFreeze, freezeCount, queued }
 */
export async function syncStreakAfterStudy(userId, { studyDate = null } = {}) {
  const streakData = await getStreak(userId);
  const local = computeStreakUpdate(streakData);

  let queued = false;
  let server = null;
  try {
    server = await touchStreak(userId, studyDate);
  } catch (_) {
    // Çevrimdışı: bağlantı gelince tekrar denensin. Artık "updates" değil
    // yalnızca tarih saklanıyor — sunucu değeri kendisi hesaplayacak.
    await setJson(STORAGE_KEYS.PENDING_STREAK, { userId, studyDate });
    queued = true;
  }

  // Sunucu bir sonuç döndürdüyse OTORİTE ODUR.
  if (server?.ok && typeof server.current_streak === "number") {
    return {
      newStreak: server.current_streak,
      freezeCount: server.freeze_count ?? local.freezeCount,
      usedFreeze: server.transition === "freeze_used",
      transition: server.transition,
      local,
      queued: false,
    };
  }

  return {
    newStreak: local.newStreak,
    freezeCount: local.freezeCount,
    usedFreeze: local.usedFreeze,
    transition: local.transition,
    local,
    queued,
  };
}
