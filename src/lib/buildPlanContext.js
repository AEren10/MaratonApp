// C) Plan kişiselleştirme bağlamı — saf yardımcılar.
// HomeScreen ve PlanDetailScreen aynı bağlamı bu fonksiyonlarla üretir (DRY).

import { trialSubjectsToCurriculumWeakAreas } from "../screens/trial/trialKeyMap";

// Son 3 denemenin ağırlıklı ortalamasıyla zayıf alan (curriculum key → başarı %).
// Ağırlık: en yeni 0.5, sonra 0.3, 0.2. Tek kötü deneme planı saptırmasın.
export function weightedWeakAreas(trials = []) {
  const recent = trials.slice(0, 3);
  if (!recent.length) return {};
  const weights = [0.5, 0.3, 0.2];

  const acc = {}; // key → { sum, wsum }
  recent.forEach((trial, i) => {
    const w = weights[i] ?? 0.2;
    const wa = trialSubjectsToCurriculumWeakAreas(trial.subjects);
    Object.entries(wa).forEach(([key, pct]) => {
      if (!acc[key]) acc[key] = { sum: 0, wsum: 0 };
      acc[key].sum += pct * w;
      acc[key].wsum += w;
    });
  });

  const out = {};
  Object.entries(acc).forEach(([key, { sum, wsum }]) => {
    out[key] = wsum > 0 ? Math.round(sum / wsum) : 50;
  });
  return out;
}

// study_logs listesinden ders → en son çalışma tarihi.
export function buildRecentStudy(logs = []) {
  const rs = {};
  logs.forEach((l) => {
    const date = l.study_date || l.date;
    if (!l.subject || !date) return;
    if (!rs[l.subject] || new Date(date) > new Date(rs[l.subject])) {
      rs[l.subject] = date;
    }
  });
  return rs;
}

// topic_progress satırlarından ders → en zayıf konular (artan başarıya göre).
// row: { subject_key, topic_name, total_questions, correct_count }
export function buildTopicWeakness(rows = []) {
  const bySubject = {};
  rows.forEach((r) => {
    const q = r.total_questions || 0;
    if (q < 5 || !r.topic_name) return; // anlamlı veri için min 5 soru
    const acc = Math.round(((r.correct_count || 0) / q) * 100);
    if (!bySubject[r.subject_key]) bySubject[r.subject_key] = [];
    bySubject[r.subject_key].push({ topic: r.topic_name, acc, q });
  });
  Object.keys(bySubject).forEach((k) => {
    bySubject[k].sort((a, b) => a.acc - b.acc);
  });
  return bySubject;
}
