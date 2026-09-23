// DURAK TIKI -> CALISMA KAYDI (saf katman).
//
// NEDEN VAR
// Durak tiklemek yalnizca `completed = true` yaziyordu: ne soru, ne dakika.
// Gunun butun duraklarini tiklersen grafik sifirda kaliyor, "0/110" hic
// kipirdamiyordu. Ekranin en gorunur seyi, en sik yapilan eyleme cevap
// vermiyordu.
//
// KAYIT BIR BEYANDIR
// Tiklenen duragin PLANLANAN sayilari kaydediliyor: "tikliyorsan planlanan
// kadarini yaptin". Bu uygulamada calisma kaydi zaten beyandir -- elle giris
// de oyle. Deneme tahmini bundan beslenmedigi icin (o denemelerden gelir)
// tahmine bulasmiyor.
//
// HER DURAKTA SORU SAYISI YOK
// Bazi duraklar yalniz sure tasiyor. O zaman soru 0 yaziliyor ve gun
// "yalniz dakika" haline dusuyor -- grafikte zaten ayri bir hali var, sifir
// gibi gorunmuyor ama hedefe de sayilmiyor.

/** Kayit durakla AYNI kimligi tasir: iki kez tiklemek iki kayit yaratmaz. */
export function stopLogOperationId(stopId) {
  return stopId ? `stop_log_${stopId}` : null;
}

/**
 * Tiklenen duragin calisma kaydi. Kaydedilecek bir sey yoksa null doner:
 * ne soru ne dakika olan bir durak icin bos kayit yazmayiz.
 */
export function buildStopStudyLog({ stop, userId, studyDate }) {
  if (!stop || !userId || !studyDate) return null;

  const questions = Math.max(0, Number(stop.count) || 0);
  const minutes = Math.max(0, Number(stop.minutes) || 0);
  if (questions === 0 && minutes === 0) return null;

  const operationId = stopLogOperationId(stop.id);
  if (!operationId) return null;

  return {
    user_id: userId,
    subject: stop.subject || null,
    topic: stop.topic || stop.planTopicName || stop.label || null,
    question_count: questions,
    duration_minutes: minutes,
    study_date: studyDate,
    client_operation_id: operationId,
    // Kaynagi isaretliyoruz: sonradan kronometreyle gercek kayit gelirse
    // hangisinin beyan hangisinin olcum oldugu ayirt edilebilsin.
    note: "durak",
  };
}
