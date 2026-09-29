// DOGRULUK BILINMIYORSA -- %0 degil, "bilinmiyor".
//
// Kayit formlarinin cogu dogru sayisini sormuyor; kayitlarin buyuk
// kisminda correct_count = 0. Motor bunu "%0 dogruluk" okuyordu: calisilan
// HER konu zayif damgasi yiyordu, hicbir konu ustalasilamiyordu (ustalik
// %80 dogruluk ister) ve tekrar dongusu hic calismiyordu.
//
// Kural:
//   - dogru sayisi girilmisse gercek dogruluk
//   - girilmemisse ogrencinin geri bildirimi: kolaydi %85, zorladi %55
//   - o da yoksa hacim: 40+ soru cozulmus konu ustalik seviyesinde (%82)
//     sayilir (tekrar dongusune girebilsin), daha azi notr %70
// known=false iken "zayif alan" isareti KONMAZ: bilmedigimiz seyi soylemeyiz.

const FEEL_ACC = { easy: 85, ok: 72, hard: 55 };
const VOLUME_MASTERY_Q = 40;

export function effectiveAccuracy({ q = 0, correct = 0, feel = null } = {}) {
  const questions = Number(q) || 0;
  const right = Number(correct) || 0;
  if (questions <= 0) return { acc: 0, known: false };
  if (right > 0) return { acc: Math.round((right / questions) * 100), known: true };
  if (FEEL_ACC[feel]) return { acc: FEEL_ACC[feel], known: false };
  return { acc: questions >= VOLUME_MASTERY_Q ? 82 : 70, known: false };
}
