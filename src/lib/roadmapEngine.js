// I) Adaptif yol haritası motoru.
// Kalan haftalara, ustalaşılmamış konuları zayıflık önceliğiyle dağıtır.
// Her açılışta yeniden hesaplanır: ustalaşılan konular düşer, kalanlar yeniden yayılır.

import { getMastery } from "./mastery";

const MAX_WEEKS = 12;

// pool: getSubjectsForExam çıktısı (her biri { key, label, color, topics: [...] })
// progressByKey: { [subjectKey]: { [topicName]: { total_questions, correct_count } } }
// weakAreas: { [curriculumKey]: acc% } — düşük acc = yüksek öncelik
// daysLeft: sınava kalan gün (null olabilir)
export function buildRoadmap({ pool = [], progressByKey = {}, weakAreas = {}, daysLeft = null }) {
  const weeksLeft = daysLeft != null
    ? Math.max(1, Math.min(MAX_WEEKS, Math.ceil(daysLeft / 7)))
    : MAX_WEEKS;

  // Ustalaşılmamış konuları topla.
  const remaining = [];
  let masteredCount = 0;
  let totalCount = 0;

  // Dersleri zayıflığa göre sırala (düşük acc önce).
  const ordered = [...pool].sort((a, b) => (weakAreas[a.key] ?? 60) - (weakAreas[b.key] ?? 60));

  ordered.forEach((subject) => {
    const prog = progressByKey[subject.key] || {};
    (subject.topics || []).forEach((t) => {
      const name = typeof t === "string" ? t : t.name;
      totalCount += 1;
      const tp = prog[name];
      const q = tp?.total_questions || 0;
      const acc = q > 0 ? Math.round(((tp.correct_count || 0) / q) * 100) : 0;
      const mastery = getMastery({ q, acc });
      if (mastery.level === "mastered") {
        masteredCount += 1;
        return;
      }
      remaining.push({
        subject: subject.key,
        subjectLabel: subject.label,
        color: subject.color,
        topic: name,
      });
    });
  });

  // Kalan konuları haftalara dağıt.
  const perWeek = Math.max(1, Math.ceil(remaining.length / weeksLeft));
  const weeks = [];
  for (let w = 0; w < weeksLeft; w++) {
    const slice = remaining.slice(w * perWeek, (w + 1) * perWeek);
    if (!slice.length && w > 0) break;
    weeks.push({
      weekNo: w + 1,
      isCurrent: w === 0,
      topics: slice,
    });
  }

  return {
    weeksLeft,
    totalCount,
    masteredCount,
    remainingCount: remaining.length,
    weeks,
  };
}
