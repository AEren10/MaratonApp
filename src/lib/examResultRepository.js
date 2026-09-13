import { getExamResult, upsertExamResult } from "../supabase/examResults";
import { loadLocalExamResult, saveLocalExamResult } from "./examResultStore";

// Sinav sonucunun tek okuma/yazma kapisi. Otorite: sunucu. Istisna: yerelde
// "pending" isaretli kayit — sunucuya yazilamamis en taze deger o.
// exam_results tablosu yoksa (migration uygulanmamis) ya da baglanti yoksa
// ekran yerel kopyayla calismaya devam eder.

async function pushPending(userId, local) {
  try {
    await upsertExamResult(userId, local);
    const synced = { ...local, pending: false };
    await saveLocalExamResult(userId, synced);
    return synced;
  } catch {
    return local;
  }
}

export async function loadExamResult(userId, examType, examDate) {
  if (!userId || !examType || !examDate) return null;
  const local = await loadLocalExamResult(userId, examType, examDate).catch(() => null);
  if (local?.pending) return pushPending(userId, local);
  try {
    const remote = await getExamResult(userId, examType, examDate);
    if (!remote) return local;
    const entry = { ...remote, pending: false };
    await saveLocalExamResult(userId, entry).catch(() => {});
    return entry;
  } catch {
    return local;
  }
}

export async function saveExamResult(userId, { examType, examDate, record, forecast }) {
  const entry = { examType, examDate, record, forecast: forecast ?? null, pending: true };
  await saveLocalExamResult(userId, entry);
  const pushed = await pushPending(userId, entry);
  return { entry: pushed, synced: pushed.pending === false };
}
