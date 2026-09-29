// KISISEL HIZ -- ogrencinin GERCEK "dakika / soru" degeri, ders ders.
//
// Konu maliyeti sabit hizlarla hesaplaniyordu (kolay 1.1, orta 1.6, zor
// 2.4 dk/soru). Soruyu 0.8 dakikada cozen ogrenciye "35 dk" diye verilen
// durak 18 dakikada bitiyor, 3 dakikada cozen icin 70 dakika suruyordu.
// Her calisma kaydi sure ve soru sayisi tasiyor; hiz olculebilir.
//
// Olcum dayanikli olmali: elle girilen kayitlarda "27 soru, 1 dk" gibi
// gurultu var. Kural:
//   - yalniz en az 5 soru ve 5 dakikalik kayit
//   - kayit basina hiz [0.3, 6] dk/soru araligina kirpilir
//   - ders basina MEDYAN (tek uc kayit sonucu oynatmaz)
//   - en az 3 kayit ve 30 soru yoksa o ders icin olcum yok (null)
// Ders olcumu yoksa tum derslerin ortak medyani kullanilir; o da yoksa
// motor sabit hizlara duser.

const MIN_Q = 5;
const MIN_MIN = 5;
const MIN_LOGS = 3;
const MIN_TOTAL_Q = 30;
const CLAMP = [0.3, 6];
// Sabit modelin "orta" hizi: kisisel hizi zorluk carpanina cevirmek icin.
export const BASE_MINUTES_PER_QUESTION = 1.6;

const median = (arr) => {
  if (!arr.length) return null;
  const a = [...arr].sort((x, y) => x - y);
  const i = Math.floor(a.length / 2);
  return a.length % 2 ? a[i] : (a[i - 1] + a[i]) / 2;
};

function samplesOf(logs) {
  const bySubject = {};
  for (const log of logs || []) {
    const q = Number(log.question_count ?? log.questionCount) || 0;
    const m = Number(log.duration_minutes ?? log.duration) || 0;
    const subject = log.subject;
    if (!subject || q < MIN_Q || m < MIN_MIN) continue;
    const mpq = Math.min(CLAMP[1], Math.max(CLAMP[0], m / q));
    (bySubject[subject] = bySubject[subject] || []).push({ mpq, q });
  }
  return bySubject;
}

/**
 * @returns { bySubject: { [subjectKey]: dk/soru }, overall: dk/soru|null }
 */
export function personalPace(logs = []) {
  const bySubject = {};
  const all = [];
  for (const [subject, samples] of Object.entries(samplesOf(logs))) {
    samples.forEach((s) => all.push(s.mpq));
    const totalQ = samples.reduce((n, s) => n + s.q, 0);
    if (samples.length < MIN_LOGS || totalQ < MIN_TOTAL_Q) continue;
    bySubject[subject] = Math.round(median(samples.map((s) => s.mpq)) * 100) / 100;
  }
  const overall = all.length >= MIN_LOGS ? Math.round(median(all) * 100) / 100 : null;
  return { bySubject, overall };
}

/**
 * Konunun dakika/soru degeri. Zorluk farki korunur: kisisel hiz "orta"
 * konunun hizi sayilir, kolay/zor ayni oranla olceklenir.
 */
export function minutesPerQuestionFor(pace, subjectKey, difficultyFactor) {
  const own = pace?.bySubject?.[subjectKey] ?? pace?.overall ?? null;
  if (own == null) return null;
  return Math.round(own * difficultyFactor * 100) / 100;
}
