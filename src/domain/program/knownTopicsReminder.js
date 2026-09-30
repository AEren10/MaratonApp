// AYLIK HATIRLATMA: "Okulda bitirdigin konulari isaretle".
// Rota isaretli konulari tekrar etmiyor (route_prefs.known_topics); okulda
// ilerleyen ogrenci isaretlemezse rota bildigi konuyu yeniden verir.
// Ilk iki hafta sorulmaz (kurulum zaten soruyor, ekran dolu); sonra en fazla
// ayda bir. Kapatmak da, satira basmak da sayaci sifirlar.
const DAY = 86400000;
export const KNOWN_TOPICS_FIRST_AFTER_DAYS = 14;
export const KNOWN_TOPICS_EVERY_DAYS = 30;

export function knownTopicsReminderDue({ now = Date.now(), accountCreatedAt = null, lastAt = 0 } = {}) {
  const created = accountCreatedAt ? new Date(accountCreatedAt).getTime() : NaN;
  if (!Number.isFinite(created) || now - created < KNOWN_TOPICS_FIRST_AFTER_DAYS * DAY) return false;
  return !lastAt || now - lastAt >= KNOWN_TOPICS_EVERY_DAYS * DAY;
}
