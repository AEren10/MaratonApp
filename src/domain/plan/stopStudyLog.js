import { todayTR } from "../../lib/dateUtils.js";
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
// Tarih tasimayan duraklar ("ai_suggestion", rota yokken "plan_ders_konu")
// her gun ayni kimlikle geliyordu: ertesi gun tiklenince sunucu kaydi "zaten
// var" sayip bugunun calismasini yazmiyor, tik geri alininca dunku kaydi
// siliyordu (9 Ekim denetimi). Bunlarin kimligine gun eklenir.
const undated = (id) => id === "ai_suggestion" || String(id).startsWith("plan_");

export function stopLogOperationId(stopId, day = todayTR()) {
  if (!stopId) return null;
  return undated(stopId) ? `stop_log_${stopId}_${day}` : `stop_log_${stopId}`;
}

/**
 * Hafta tekrari birden cok konuyu kapsar: kayit o konulara esit bolunur.
 * Tek "Haftalik tekrar" kaydi ayri bir ozel konu yaratiyor, tekrar edilen
 * konularin ilerlemesi ve hafizasi hic guncellenmiyordu.
 * @returns kayit dizisi (bos olabilir); kimlikler `${op}_${i}`.
 */
export function buildStopStudyLogs({ stop, userId, studyDate }) {
  const topics = Array.isArray(stop?.weeklyTopics) ? stop.weeklyTopics.filter(Boolean) : [];
  const single = buildStopStudyLog({ stop, userId, studyDate });
  if (!single || topics.length < 2) return single ? [single] : [];
  const n = topics.length;
  const part = (total, i) => Math.round((total * (i + 1)) / n) - Math.round((total * i) / n);
  return topics.map((topic, i) => ({
    ...single,
    topic,
    question_count: part(single.question_count, i),
    duration_minutes: part(single.duration_minutes, i),
    client_operation_id: `${single.client_operation_id}_${i}`,
  }));
}

/** Tiki geri alirken silinecek kayit kimlikleri. */
export function stopLogOperationIds(stop) {
  const base = stopLogOperationId(stop?.id);
  if (!base) return [];
  const topics = Array.isArray(stop?.weeklyTopics) ? stop.weeklyTopics.filter(Boolean) : [];
  // Bolmeden once yazilmis tek kayit da (base) silinir.
  return topics.length < 2 ? [base] : [base, ...topics.map((_, i) => `${base}_${i}`)];
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
