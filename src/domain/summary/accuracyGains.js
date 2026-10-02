// ILERLEME KANITI: KONU DOGRULUGU (saf).
// "420 soru" aktivitedir; "Geometri %48 -> %64" gelisimdir. Yalniz dogru
// sayisi GIRILMIS kayitlardan (correct > 0; olculmus sifirlar ihtiyatla
// disarida), iki donemde de en az MIN_Q soru varsa. Uydurma yok: veri
// yetmezse bos liste.
const MIN_Q = 10;
const MIN_GAIN = 5;

const dateOf = (l) => String(l?.study_date || l?.studyDate || "").slice(0, 10);

function bucket(logs, from, to) {
  const map = new Map();
  for (const l of logs || []) {
    const d = dateOf(l);
    const q = Number(l.questionCount ?? l.question_count) || 0;
    const c = Number(l.correctCount ?? l.correct_count) || 0;
    if (!d || d < from || d > to || q <= 0 || c <= 0 || !l.topic) continue;
    const key = `${l.subject}|${l.topic}`;
    const cur = map.get(key) || { subject: l.subject, topic: l.topic, q: 0, c: 0 };
    cur.q += q;
    cur.c += Math.min(c, q);
    map.set(key, cur);
  }
  return map;
}

/** @returns [{ subject, topic, before, after }] en buyuk artistan, en fazla `limit` */
export function accuracyGains(logs, range, limit = 2) {
  if (!range?.start) return [];
  const now = bucket(logs, range.start, range.end);
  const before = bucket(logs, range.prevStart, range.prevEnd);
  const out = [];
  for (const [key, cur] of now) {
    const prev = before.get(key);
    if (!prev || cur.q < MIN_Q || prev.q < MIN_Q) continue;
    const a = Math.round((prev.c / prev.q) * 100);
    const b = Math.round((cur.c / cur.q) * 100);
    if (b - a >= MIN_GAIN) out.push({ subject: cur.subject, topic: cur.topic, before: a, after: b });
  }
  return out.sort((x, y) => (y.after - y.before) - (x.after - x.before)).slice(0, limit);
}
