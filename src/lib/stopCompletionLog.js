import { getStudyLogByClientOperationId, deleteStudyLog } from "../supabase/studyLogs";
import { saveStudyLogOffline, removeFromQueue } from "./offlineQueue";
import { buildStopStudyLogs, stopLogOperationIds } from "../domain/plan/stopStudyLog";
import { todayTR } from "./dateUtils";

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
    for (const log of logs) await saveStudyLogOffline(log);
    return true;
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
