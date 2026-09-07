const MS_PER_DAY = 86400000;

const TR_TZ = "Europe/Istanbul";

export function differenceInDays(a, b) {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utcA - utcB) / MS_PER_DAY);
}

/**
 * Bir Date'i TR gününe göre "YYYY-MM-DD" anahtarına çevirir.
 *
 * Neden: kod tabanının her yerinde `d.toISOString().split("T")[0]` vardı.
 * toISOString UTC'ye çevirir ve TR = UTC+3 olduğu için gece 00:00-03:00
 * arasında bir önceki günü döndürür. Sonucu: o saatlerde takvimde "bugün"
 * yanlış güne düşüyor, günlük hedef ödülü ikinci kez verilebiliyor, ısı
 * haritası kayıyor, meydan okuma başlangıç/bitiş tarihleri bir gün geri
 * geliyordu. sv-SE yerel biçimi zaten YYYY-MM-DD üretir.
 */
export function dateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("sv-SE", { timeZone: TR_TZ });
}

export function todayTR() {
  return dateKey(new Date());
}

/** N gün önce/sonranın TR gün anahtarı. */
export function dateKeyOffset(days, from = new Date()) {
  return dateKey(new Date(from.getTime() + days * MS_PER_DAY));
}

/**
 * Haftanın başlangıcı (Pazartesi 00:00, yerel).
 * useWeeklyReport ve useWeeklyTrialReport'ta birebir aynı kopya vardı.
 */
export function startOfWeek(from = new Date()) {
  const d = new Date(from);
  const day = (d.getDay() + 6) % 7; // Pazartesi = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * TR haftasının başlangıcı (Pazartesi 00:00 Europe/Istanbul) — ISO damgası.
 *
 * Sunucu haftalık XP'yi `date_trunc('week', now() AT TIME ZONE
 * 'Europe/Istanbul')` ile hesaplıyor. İstemci tarafı cihazın yerel saatiyle
 * hesaplarsa yurtdışındaki kullanıcıda haftalık XP ile lig sıralaması
 * uyuşmuyor. Türkiye 2016'dan beri yaz saati uygulamıyor, sabit UTC+3.
 */
export function startOfWeekTR(from = new Date()) {
  const trKey = dateKey(from);                  // TR gününe göre YYYY-MM-DD
  const [y, m, d] = trKey.split("-").map(Number);
  // O TR gününün haftanın kaçıncı günü olduğu (Pazartesi = 0)
  const weekday = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(y, m - 1, d - weekday));
  const pad = (n) => String(n).padStart(2, "0");
  const key = `${monday.getUTCFullYear()}-${pad(monday.getUTCMonth() + 1)}-${pad(monday.getUTCDate())}`;
  return `${key}T00:00:00+03:00`;
}
