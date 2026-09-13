import * as appStorage from "./storage/appStorage";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";

// Sinav sonucunun YEREL kopyasi. Otorite kurali (AGENTS.md): sunucu
// otoritedir; yerel kopya yalniz sunucuya yazilamamis (pending) deger icin
// kazanir. exam_results tablosu canliya uygulanana kadar tek kayit burada.
// Cikista SILINMEZ: yilin tek kaydi. Kullanici ayrimi anahtardaki id ile.
const keyFor = (userId) => userScopedKey(STORAGE_KEYS.EXAM_RESULT, userId);

const sameExam = (entry, examType, examDate) =>
  entry && entry.examType === examType && entry.examDate === examDate;

export async function loadLocalExamResult(userId, examType, examDate) {
  const entry = await appStorage.getJson(keyFor(userId), null);
  return sameExam(entry, examType, examDate) ? entry : null;
}

export async function saveLocalExamResult(userId, entry) {
  await appStorage.setJson(keyFor(userId), entry);
}
