import { streakStatus } from "./effectiveStreak.js";

// SERI SERIDI -- ana sayfa ve seri paneli icin saf veri.
//
// Hafta noktalari seri araligindan turetilir: son calisma gunu ve seri
// uzunlugu art arda gunleri verir (ek sorgu yok). Joker'in kurtardigi gun
// de aralikta sayilir; seri kirilmadigi icin dogru olan bu.

const DAY = 86400000;
const LABELS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];
const utc = (key) => { const [y, m, d] = String(key).slice(0, 10).split("-").map(Number); return Date.UTC(y, m - 1, d); };
const keyOf = (ms) => new Date(ms).toISOString().slice(0, 10);

// Joker her pazartesi yenilenir; yenileme ani gectiyse sunucu bir sonraki
// kayitta 1'e cekecek -- gosterim simdiden 1 der.
export function effectiveFreeze({ freezeCount = 0, freezeResetAt = null } = {}, now = new Date()) {
  if (!freezeResetAt || new Date(freezeResetAt).getTime() <= now.getTime()) return 1;
  return Math.max(0, Number(freezeCount) || 0);
}

export function streakWeek(data = {}, todayKey, now = new Date()) {
  const freeze = effectiveFreeze(data, now);
  const status = streakStatus({ ...data, freezeCount: freeze }, todayKey);
  const today = utc(todayKey);
  const weekday = (new Date(today).getUTCDay() + 6) % 7;
  const monday = today - weekday * DAY;
  const last = data.lastStudyDate ? utc(data.lastStudyDate) : null;
  const first = last != null && status.value > 0 ? last - (status.value - 1) * DAY : null;

  const days = LABELS.map((label, i) => {
    const ms = monday + i * DAY;
    const done = first != null && ms >= first && ms <= last;
    const state = done ? "done" : ms === today ? "today" : ms > today ? "future" : "missed";
    return { key: keyOf(ms), label, state };
  });

  return { value: status.value, state: status.state, freeze, days, line: streakLine(status), jokerLine: jokerLine(freeze) };
}

function streakLine({ value, state }) {
  if (state === "done_today") return `Bugün tamam. Yarın bir durak, seri ${value + 1} olur.`;
  if (state === "at_risk") return `Bugün bir durak kapat, seri ${value + 1} olur.`;
  if (state === "freeze_saves") return "Dün ara verdin. Bugün çalışırsan joker serini korur.";
  return "Bugün bir durak kapat, serin başlasın.";
}

function jokerLine(freeze) {
  return freeze > 0 ? "Joker hazır: bir gün atlarsan seri bozulmaz." : "Joker bu hafta kullanıldı, pazartesi yenilenir.";
}
