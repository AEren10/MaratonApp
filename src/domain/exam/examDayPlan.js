// SINAV GUNU PLANI — saf mantik (tasarim AKIS 14 · "Sınav günü planı").
//
// Ekranda gorunen her sey kullanicinin kendi girdigi bilgi: sinav yeri,
// salon, cikis saati, ulasim ve canta listesi. Hicbiri sunucudan gelmiyor,
// hicbiri tahmin edilmiyor. Tek TURETILMIS deger hatirlatma ani: sinav
// tarihinin bir gun oncesi, saat 20:00.

export const EXAM_DAY_BAG = Object.freeze([
  { key: "kimlik", label: "Kimlik", required: true },
  { key: "kalem", label: "Kurşun kalem, silgi, kalemtıraş" },
  { key: "saat", label: "Analog saat" },
  { key: "su", label: "Şeffaf pet su" },
]);

export const REMINDER_HOUR = 20;

const TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/** "0740" / "7:4" gibi yarim girdiyi ekranin gosterebilecegi hale getirir. */
export function sanitizeTimeInput(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function isValidTime(value) {
  return TIME_PATTERN.test(String(value ?? ""));
}

export function normalizeExamDayPlan(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const checked = source.checked && typeof source.checked === "object" ? source.checked : {};
  const extras = Array.isArray(source.extras) ? source.extras : [];
  return {
    venue: typeof source.venue === "string" ? source.venue : "",
    hall: typeof source.hall === "string" ? source.hall : "",
    leaveAt: isValidTime(source.leaveAt) ? source.leaveAt : "",
    transport: typeof source.transport === "string" ? source.transport : "",
    remind: source.remind !== false,
    extras: extras
      .filter((item) => item && typeof item.label === "string" && item.label.trim())
      .map((item) => ({ key: String(item.key), label: item.label.trim() })),
    checked: Object.fromEntries(
      Object.entries(checked).filter(([, value]) => value === true),
    ),
  };
}

/** Hatirlatma ani: sinavdan bir gun once 20:00. Gecmisteyse null. */
export function examEveReminderAt(examDate, now = new Date(), hour = REMINDER_HOUR) {
  if (!examDate) return null;
  const exam = examDate instanceof Date ? examDate : new Date(examDate);
  if (Number.isNaN(exam.getTime())) return null;
  const at = new Date(exam.getFullYear(), exam.getMonth(), exam.getDate() - 1, hour, 0, 0, 0);
  return at.getTime() > now.getTime() ? at : null;
}

/** Kaydedilecek bir sey var mi — bos formda buton pasif kalir. */
export function planHasContent(plan) {
  const p = normalizeExamDayPlan(plan);
  return Boolean(
    p.venue.trim() || p.hall.trim() || p.leaveAt || p.transport.trim()
    || p.extras.length || Object.keys(p.checked).length,
  );
}

/** Canta listesi = sabit kalemler + kullanicinin ekledikleri. */
export function bagItems(plan) {
  const p = normalizeExamDayPlan(plan);
  return [...EXAM_DAY_BAG, ...p.extras].map((item) => ({
    ...item,
    done: p.checked[item.key] === true,
  }));
}

export const TR_MONTHS = Object.freeze([
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
]);

/** "19 Haziran 20:00 · çanta ve saat" — hatirlatma ani yoksa null. */
export function reminderCaption(examDate, now = new Date()) {
  const at = examEveReminderAt(examDate, now);
  if (!at) return null;
  const hh = String(at.getHours()).padStart(2, "0");
  return `${at.getDate()} ${TR_MONTHS[at.getMonth()]} ${hh}:00 · çanta ve saat`;
}

/** Ana Sayfa sinav gunu karti: "Kadıköy Anadolu Lisesi · B Blok · 12". */
export function venueLine(plan) {
  const p = normalizeExamDayPlan(plan);
  const parts = [p.venue.trim(), p.hall.trim()].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}
