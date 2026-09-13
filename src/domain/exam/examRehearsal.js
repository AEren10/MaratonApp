// DENEME PROVASI — saf mantik (tasarim AKIS 14 · "Deneme Provası").
//
// "Gerçek oturum uzunluğu, gerçek saat." Oturum sureleri ve baslangic
// saatleri OSYM/MEB oturum duzeninden; kullanici degistirebilir.
// Hatirlatma baslangictan 30 dk once, tek sefer.

import { dateKey } from "../../lib/dateUtils.js";
import { timeLocative } from "../../lib/trNumberSuffix.js";

export const REMINDER_LEAD_MIN = 30;

const TYT = { key: "TYT", minutes: 165, start: "10:15" };
const AYT = { key: "AYT", minutes: 180, start: "10:15" };
const YDT = { key: "YDT", minutes: 180, start: "10:15" };
const LGS = { key: "LGS", minutes: 155, start: "09:30" };

export function rehearsalSessions(examType) {
  if (examType === "lgs") return [LGS];
  if (examType === "tyt_ayt") return [TYT, AYT];
  if (examType === "dil") return [TYT, YDT];
  return [TYT];
}

export function sessionLabel(session) {
  return session ? `${session.key} · ${session.minutes} dk` : "";
}

export const WEEKDAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const MONTHS_SHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

/** "Pazar, 14 Haz" */
export function formatRehearsalDate(date) {
  const d = date instanceof Date ? date : new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** Bugunden sinavin bir gun oncesine kadar (en fazla 14 gun) secilebilir gunler. */
export function rehearsalDateOptions(examDate, now = new Date(), limit = 14) {
  const out = [];
  const exam = examDate ? dateKey(examDate) : null;
  for (let i = 0; i < limit; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 12);
    const key = dateKey(d);
    if (exam && key >= exam) break;
    out.push(key);
  }
  return out;
}

export function rehearsalStartAt(rehearsal) {
  if (!rehearsal?.dateKey || !/^\d{2}:\d{2}$/.test(rehearsal.start || "")) return null;
  const at = new Date(`${rehearsal.dateKey}T${rehearsal.start}:00`);
  return Number.isNaN(at.getTime()) ? null : at;
}

export function rehearsalReminderAt(rehearsal, now = new Date()) {
  const start = rehearsalStartAt(rehearsal);
  if (!start) return null;
  const at = new Date(start.getTime() - REMINDER_LEAD_MIN * 60000);
  return at.getTime() > now.getTime() ? at : null;
}

function minusLead(time) {
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + m - REMINDER_LEAD_MIN + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** "Sabah 09:45'te tek hatırlatma" */
export function reminderLine(start) {
  if (!/^\d{2}:\d{2}$/.test(start || "")) return null;
  const at = minusLead(start);
  const morning = Number(at.slice(0, 2)) < 12;
  return `${morning ? "Sabah " : ""}${at}'${timeLocative(at)} tek hatırlatma`;
}

export function isRehearsalDay(rehearsal, now = new Date()) {
  return Boolean(rehearsal?.dateKey) && rehearsal.dateKey === dateKey(now);
}
