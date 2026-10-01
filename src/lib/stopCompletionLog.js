import { getStudyLogByClientOperationId, deleteStudyLog, updateStudyLog } from "../supabase/studyLogs";
import { saveStudyLogOffline, removeFromQueue } from "./offlineQueue";
import { buildStopStudyLogs, stopLogOperationIds } from "../domain/plan/stopStudyLog";
import { todayTR } from "./dateUtils";
import { touchStreak } from "../supabase/streaks";

// Durak tikinin IO tarafi. Karar ve bicim domain/plan/stopStudyLog.js'te.

/**
 * Durak tamamlandi: planlanan sayilari calisma kaydi olarak yazar (hafta
 * tekrari konularina bolunerek). Cevrimdisiysa kuyruga girer — tik cihazda
 * kalirken kayit kaybolmaz.
 */
export async function recordStopCompletion(userId, stop) {
  const logs = buildStopStudyLogs({ stop, userId, studyDate: todayTR() });
  if (!logs.length) return false;
  try {
    let saved = false;
    for (const log of logs) saved = (await saveStudyLogOffline(log)).saved || saved;
    // Seriyi sunucu kayitla birlikte gunceller (study_logs tetikleyicisi);
    // burada yalniz guncel degeri okuyup ekrana yansitmak icin cagrilir.
    if (!saved) return true;
    const streak = await touchStreak(userId).catch(() => null);
    return streak?.ok ? streak : true;
  } catch {
    // Kayit yazilamazsa tik yine de durur: durak durumu ayri bir yazma.
    return false;
  }
}

/**
 * Tik geri alindi: o durak icin yazilan kayitlari siler.
 *
 * Henuz gonderilmemis olabilir — once kuyruktan cikariliyor, sonra sunucuda
 * aranip siliniyor. Ikisi de yapilmazsa geri alinan durak grafikte dolu
 * kalirdi ve kullanici neden oldugunu anlamazdi.
 */
export async function removeStopCompletion(userId, stop) {
  const operationIds = stopLogOperationIds(stop);
  if (!userId || !operationIds.length) return false;
  let ok = true;
  for (const operationId of operationIds) {
    await removeFromQueue(operationId).catch(() => false);
    try {
      const existing = await getStudyLogByClientOperationId(userId, operationId);
      if (existing?.id) await deleteStudyLog(existing.id, userId);
    } catch {
      ok = false;
    }
  }
  return ok;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Tikten sonra sorulan dogru sayisi yalniz tek konulu duraga yazilir. */
export function canAskStopCorrect(stop) {
  const topics = Array.isArray(stop?.weeklyTopics) ? stop.weeklyTopics.filter(Boolean) : [];
  return Boolean(stop?.id) && (Number(stop?.count) || 0) > 0 && topics.length < 2;
}

/**
 * Tikle yazilan kayda dogru sayisini ekler. Kayit tikle ayni anda yaziliyor;
 * henuz sunucuda gorunmuyorsa kisa araliklarla birkac kez bakar. Cevrimdisi
 * kuyrukta kalan kayitta dogru yazilmaz (bilinmiyor kalir) -- kayip degil.
 */
export async function recordStopCorrect(userId, stop, correct) {
  const operationId = stopLogOperationIds(stop)[0];
  const value = Math.max(0, Math.min(Number(correct) || 0, Number(stop?.count) || 0));
  if (!userId || !operationId || value <= 0) return false;
  for (let i = 0; i < 4; i += 1) {
    try {
      const log = await getStudyLogByClientOperationId(userId, operationId);
      if (log?.id) {
        await updateStudyLog(log.id, { user_id: userId, correct_count: Math.min(value, log.question_count || value) });
        return true;
      }
    } catch {
      return false;
    }
    await wait(700);
  }
  return false;
}
