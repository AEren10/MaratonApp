import { getStudyLogByClientOperationId, deleteStudyLog } from "../supabase/studyLogs";
import { saveStudyLogOffline, removeFromQueue } from "./offlineQueue";
import { buildStopStudyLog, stopLogOperationId } from "../domain/plan/stopStudyLog";
import { todayTR } from "./dateUtils";

// Durak tikinin IO tarafi. Karar ve bicim domain/plan/stopStudyLog.js'te.

/**
 * Durak tamamlandi: planlanan sayilari calisma kaydi olarak yazar.
 * Cevrimdisiysa kuyruga girer — tik cihazda kalirken kayit kaybolmaz.
 */
export async function recordStopCompletion(userId, stop) {
  const log = buildStopStudyLog({ stop, userId, studyDate: todayTR() });
  if (!log) return false;
  try {
    await saveStudyLogOffline(log);
    return true;
  } catch {
    // Kayit yazilamazsa tik yine de durur: durak durumu ayri bir yazma.
    return false;
  }
}

/**
 * Tik geri alindi: o durak icin yazilan kaydi siler.
 *
 * Henuz gonderilmemis olabilir — once kuyruktan cikariliyor, sonra sunucuda
 * aranip siliniyor. Ikisi de yapilmazsa geri alinan durak grafikte dolu
 * kalirdi ve kullanici neden oldugunu anlamazdi.
 */
export async function removeStopCompletion(userId, stop) {
  const operationId = stopLogOperationId(stop?.id);
  if (!userId || !operationId) return false;

  await removeFromQueue(operationId).catch(() => false);
  try {
    const existing = await getStudyLogByClientOperationId(userId, operationId);
    if (existing?.id) await deleteStudyLog(existing.id, userId);
    return true;
  } catch {
    return false;
  }
}
