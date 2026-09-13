import * as appStorage from "./storage/appStorage";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { normalizeExamDayPlan, examEveReminderAt } from "../domain/exam/examDayPlan";
import { scheduleExamEveReminder, cancelExamEveReminder } from "./notifications";

// Sinav gunu plani cihaza ozel: sinav yeri, salon, cikis saati, canta.
// Sunucuda karsiligi yok. Anahtar kullanici kimligiyle ayriliyor, bu yuzden
// ayni cihazda baska hesap acilirsa plan sizmaz.
const keyFor = (userId) => userScopedKey(STORAGE_KEYS.EXAM_DAY_PLAN, userId);

export async function loadExamDayPlan(userId) {
  const raw = await appStorage.getJson(keyFor(userId), null);
  return raw ? { plan: normalizeExamDayPlan(raw), saved: true } : { plan: normalizeExamDayPlan(null), saved: false };
}

// Canta isaretleri Ana Sayfa'nin sinav gunu kartindan da degisiyor; plan
// kaydedilmemis olsa bile isaret tutulur ama hatirlatma kurulmaz.
export async function writeExamDayPlan(userId, plan) {
  const normalized = normalizeExamDayPlan(plan);
  await appStorage.setJson(keyFor(userId), normalized);
  return normalized;
}

export async function saveExamDayPlan(userId, plan, examDate) {
  const normalized = await writeExamDayPlan(userId, plan);
  await syncReminder(normalized, examDate);
  return normalized;
}

async function syncReminder(plan, examDate) {
  const at = plan.remind ? examEveReminderAt(examDate) : null;
  if (at) await scheduleExamEveReminder(at);
  else await cancelExamEveReminder();
}

// Sinav tarihi degisince cagrilir. Kaydedilmis plan yoksa HICBIR SEY yapmaz:
// hatirlatmayi kullanici plan ekraninda kendisi acmadan kurulmaz.
export async function rescheduleExamEveReminder(userId, examDate) {
  try {
    const { plan, saved } = await loadExamDayPlan(userId);
    if (saved) await syncReminder(plan, examDate);
  } catch {
    // Hatirlatma kurulamamasi tarih kaydini bozmamali.
  }
}
