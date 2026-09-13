import { dateKey, dateKeyOffset, startOfWeekTR } from "../../lib/dateUtils.js";

const TR_TZ = "Europe/Istanbul";

export function formatStudyMinutes(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m} dk`;
  return m ? `${h} sa ${m} dk` : `${h} sa`;
}

// Ozet satiri: 10 saatin altinda tek ondalik ("7,5"), ustunde tam sayi ("61").
export function formatHoursValue(minutes) {
  const hours = (Number(minutes) || 0) / 60;
  if (hours >= 10) return String(Math.round(hours));
  const rounded = Math.round(hours * 10) / 10;
  return String(rounded).replace(".", ",");
}

export function dayMonthLabel(key) {
  if (!key) return "";
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", timeZone: "UTC",
  });
}

export function clockLabel(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TR_TZ });
}

export function weekStartKey(now = new Date()) {
  return startOfWeekTR(now).slice(0, 10);
}

function logDate(log) {
  return log.study_date || dateKey(log.created_at) || "";
}

function monthTitle(key, now) {
  const [y, m] = key.split("-").map(Number);
  const opts = { month: "long", timeZone: "UTC" };
  if (String(y) !== dateKey(now).slice(0, 4)) opts.year = "numeric";
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString("tr-TR", opts).toLocaleUpperCase("tr");
}

export function buildStudyHistory(logs = [], now = new Date()) {
  const today = dateKey(now);
  const yesterday = dateKeyOffset(-1, now);
  const weekStart = weekStartKey(now);
  const sorted = [...logs].sort((a, b) =>
    logDate(b).localeCompare(logDate(a)) || String(b.created_at || "").localeCompare(String(a.created_at || "")));

  let totalMinutes = 0;
  let weekMinutes = 0;
  const sections = [];
  const byKey = new Map();

  for (const log of sorted) {
    const minutes = Number(log.duration ?? log.duration_minutes) || 0;
    const date = logDate(log);
    totalMinutes += minutes;
    if (date >= weekStart && date <= today) weekMinutes += minutes;

    let key; let title; let recent = false;
    if (date === today) { key = "today"; title = "BUGÜN"; recent = true; }
    else if (date === yesterday) { key = "yesterday"; title = "DÜN"; recent = true; }
    else if (date >= weekStart && date < today) { key = "week"; title = "BU HAFTA"; }
    else { key = date.slice(0, 7) || "unknown"; title = date ? monthTitle(date, now) : ""; }

    if (!byKey.has(key)) {
      const section = { key, title, rows: [] };
      byKey.set(key, section);
      sections.push(section);
    }
    const when = recent ? clockLabel(log.created_at) : dayMonthLabel(date);
    byKey.get(key).rows.push({ log, minutes, meta: [log.topic, when].filter(Boolean).join(" · ") });
  }

  return { totals: { totalMinutes, weekMinutes, count: sorted.length }, sections };
}

export function subjectMinutesInRange(logs = [], subject, fromKey, toKey) {
  return logs.reduce((sum, log) => {
    const date = logDate(log);
    if (log.subject !== subject || date < fromKey || date > toKey) return sum;
    return sum + (Number(log.duration ?? log.duration_minutes) || 0);
  }, 0);
}

// "3 saat 20 dakikaya", "2 saate", "45 dakikaya"
export function minutesDative(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return `${h} saat ${m} dakikaya`;
  if (h) return `${h} saate`;
  return `${m} dakikaya`;
}

const UNIT_SUFFIX = ["da", "de", "de", "te", "te", "te", "da", "de", "de", "da"];
const TEN_SUFFIX = { 1: "da", 2: "de", 3: "da", 4: "ta", 5: "de" };

// "21:32" -> "21:32'de" — son okunan sayinin unlu uyumu.
export function withLocative(clock) {
  if (!clock) return "";
  const [h, m] = clock.split(":").map(Number);
  const read = m || h;
  let suffix;
  if (read === 0) suffix = "da";
  else if (read % 10) suffix = UNIT_SUFFIX[read % 10];
  else suffix = TEN_SUFFIX[read / 10] || "de";
  return `${clock}'${suffix}`;
}

// Kaydi Duzenle "DEGISIKLIGIN ETKISI": duzenlenen dersin bu haftaki toplami.
// Degismiyorsa null (kart gosterilmez).
export function editWeekImpact(weekLogs = [], originalId, next, now = new Date()) {
  if (!next?.subject) return null;
  const from = weekStartKey(now);
  const to = dateKey(now);
  const before = subjectMinutesInRange(weekLogs, next.subject, from, to);
  const others = weekLogs.filter((log) => log.id !== originalId);
  const inWeek = next.studyDate >= from && next.studyDate <= to;
  const after = subjectMinutesInRange(others, next.subject, from, to) + (inWeek ? Number(next.minutes) || 0 : 0);
  if (after === before) return null;
  return { before, after, direction: after < before ? "down" : "up" };
}
