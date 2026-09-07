// Türkçe sayı/süre biçimlendirme — tek kaynak.
// Kural: ondalık virgül (58,25), binlik nokta (1.240), yüzde önde (%83).

const LOCALE = "tr-TR";

function toNum(value) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** 1240 -> "1.240" · 58.25 -> "58,25" (decimals kadar basamak) */
export function formatNumber(value, decimals = 0, fallback = "—") {
  const n = toNum(value);
  if (n === null) return fallback;
  return n.toLocaleString(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Net gibi .25 adımlı değerler: 58 -> "58" · 58.25 -> "58,25" */
export function formatNet(value, fallback = "—") {
  const n = toNum(value);
  if (n === null) return fallback;
  return n.toLocaleString(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/** 83 -> "%83" · 82.6 -> "%82,6" (decimals=1) */
export function formatPercent(value, decimals = 0, fallback = "—") {
  const n = toNum(value);
  if (n === null) return fallback;
  return "%" + formatNumber(n, decimals);
}

/** 0.83 -> "%83" — oran girdisi için */
export function formatRatioAsPercent(value, decimals = 0, fallback = "—") {
  const n = toNum(value);
  if (n === null) return fallback;
  return formatPercent(n * 100, decimals, fallback);
}

/** +12 / -3 — işaretli değişim. Renk tek başına bilgi taşımasın diye metinde de işaret var. */
export function formatDelta(value, decimals = 0, fallback = "—") {
  const n = toNum(value);
  if (n === null) return fallback;
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return sign + formatNumber(Math.abs(n), decimals);
}

/** 95 dk -> "1 sa 35 dk" · 45 -> "45 dk" · 0 -> "0 dk" */
export function formatMinutes(minutes, fallback = "—") {
  const n = toNum(minutes);
  if (n === null) return fallback;
  const total = Math.max(0, Math.round(n));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} dk`;
  if (m === 0) return `${h} sa`;
  return `${h} sa ${m} dk`;
}

/** Kronometre: 3725 sn -> "1:02:05" · 125 -> "02:05" */
export function formatDuration(seconds, fallback = "00:00") {
  const n = toNum(seconds);
  if (n === null) return fallback;
  const total = Math.max(0, Math.floor(n));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (v) => String(v).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "12 Mart" */
export function formatDayMonth(value, fallback = "—") {
  const d = toDate(value);
  if (!d) return fallback;
  return d.toLocaleDateString(LOCALE, { day: "numeric", month: "long" });
}

/** "12 Mart 2026" */
export function formatFullDate(value, fallback = "—") {
  const d = toDate(value);
  if (!d) return fallback;
  return d.toLocaleDateString(LOCALE, { day: "numeric", month: "long", year: "numeric" });
}

/** "12.03.2026" */
export function formatShortDate(value, fallback = "—") {
  const d = toDate(value);
  if (!d) return fallback;
  return d.toLocaleDateString(LOCALE, { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** "Perşembe" */
export function formatWeekday(value, fallback = "—") {
  const d = toDate(value);
  if (!d) return fallback;
  return d.toLocaleDateString(LOCALE, { weekday: "long" });
}

/** "14:30" */
export function formatTime(value, fallback = "—") {
  const d = toDate(value);
  if (!d) return fallback;
  return d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
}
