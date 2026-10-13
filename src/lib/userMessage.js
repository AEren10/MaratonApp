// Kullaniciya gosterilecek hata cumlesi. Sunucunun BILEREK yazdigi mesaj
// (RAISE EXCEPTION -> P0001, or. "Bu isim uygun değil") ve uygulamanin kendi
// attigi Turkce hata gosterilir; ham Postgres / ag / JS hatasi gosterilmez
// ("permission denied for function is_clean_text" kullaniciya cikmisti, 13 Ekim).
const RAW = /permission denied|violates|relation |function |column |syntax|jwt|network|fetch|timeout|typeerror|undefined|null value|duplicate key|schema cache/i;

export function userMessage(error, fallback) {
  const message = typeof error?.message === "string" ? error.message.trim() : "";
  if (!message) return fallback;
  if (error.code === "P0001") return message;
  if (error.code || error.details || error.hint || RAW.test(message)) return fallback;
  return message;
}
