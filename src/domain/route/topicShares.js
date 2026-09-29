import { EXAM_TOPIC_FREQUENCY } from "../../data/examFrequency.js";

// KONUNUN SINAVDAKI PAYI -- gercek OSYM sikligi.
//
// Eskiden pay = dersin soru sayisi / konu sayisi: TYT Matematik'te
// "Problemler" (yilda ~12 soru) ile "Ondalik Sayilar" ayni 1.1 soru
// sayiliyordu; rota az soru getiren konuyu cok getirenin onune koyabiliyordu.
// Simdi: kaynagi olan konu kendi ortalamasini alir, kaynagi olmayanlar
// dersin kalan payini paylasir; toplam dersin soru sayisina esitlenir.

const MIN_SHARE = 0.2;

export function topicShares(subject = {}) {
  const topics = (subject.topics || []).map((t) => (typeof t === "string" ? t : t?.name)).filter(Boolean);
  const Q = Number(subject.questionCount) || 0;
  if (!topics.length || Q <= 0) return {};
  const freq = EXAM_TOPIC_FREQUENCY[subject.key] || {};
  const known = topics.filter((t) => Number.isFinite(freq[t]));
  if (!known.length) return Object.fromEntries(topics.map((t) => [t, Q / topics.length]));

  const sumKnown = known.reduce((n, t) => n + freq[t], 0);
  const unknown = topics.filter((t) => !Number.isFinite(freq[t]));
  const rest = unknown.length ? Math.max(MIN_SHARE, (Q - sumKnown) / unknown.length) : 0;
  const raw = Object.fromEntries(topics.map((t) => [t, Math.max(MIN_SHARE, Number.isFinite(freq[t]) ? freq[t] : rest)]));
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const scale = total > 0 ? Q / total : 1;
  return Object.fromEntries(Object.entries(raw).map(([t, v]) => [t, Math.round(v * scale * 1000) / 1000]));
}

/** Pay bilgisiyle zenginlesmis ders nesnesi (motor ve net tahmini ortak). */
export function withTopicShares(subject = {}) {
  if (subject.topicShares) return subject;
  return { ...subject, topicShares: topicShares(subject) };
}
