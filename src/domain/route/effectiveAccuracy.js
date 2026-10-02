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

// Payda: dogru sayisi GIRILMIS kayitlarin sorulari (topic_progress.graded_questions).
// Bilinen ve bilinmeyen kayitlar ayni konuda karisinca correct / toplam soru
// dogrulugu yanlis dusurur (100 sorunun 20'sinde 15 dogru -> %15, oysa %75).
// graded yoksa (eski satir) toplam soruya duser.
//
// 2026-10-03: graded > 0 ise dogruluk OLCULMUSTUR -- 0 dogru da (%0). Eskiden
// dogru 0 ise "bilinmiyor" donuyordu: 50 soruda olculmus 0 dogru hacimden
// ustalik (%82) alabiliyordu. graded'a artik yalniz dogru sayisi GIRILMIS
// kayitlar giriyor (correct_count NULL = girilmedi).
export function knownAccuracy({ q = 0, correct = 0, graded = 0 } = {}) {
  const questions = Number(q) || 0;
  const right = Number(correct) || 0;
  if (questions <= 0) return null;
  const g = Number(graded) || 0;
  if (g > 0) return Math.min(100, Math.round((right / Math.max(Math.min(g, questions), right)) * 100));
  // Eski satir (graded yok): yalniz dogru girilmisse.
  if (right <= 0) return null;
  return Math.min(100, Math.round((right / Math.max(questions, right)) * 100));
}

/** topic_progress satirindan bilinen dogruluk (%), bilinmiyorsa null. */
export function rowAccuracy(row) {
  if (!row) return null;
  return knownAccuracy({ q: row.total_questions, correct: row.correct_count, graded: row.graded_questions });
}

export function effectiveAccuracy({ q = 0, correct = 0, graded = 0, feel = null } = {}) {
  const questions = Number(q) || 0;
  if (questions <= 0) return { acc: 0, known: false };
  const known = knownAccuracy({ q: questions, correct, graded });
  if (known != null) return { acc: known, known: true };
  if (FEEL_ACC[feel]) return { acc: FEEL_ACC[feel], known: false };
  return { acc: questions >= VOLUME_MASTERY_Q ? 82 : 70, known: false };
}
