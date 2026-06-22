// AI study suggestions — rule-based engine (no API keys, runs locally).

import { getAllSubjects } from "../screens/trial/trialTypes";
import { C } from "../themes/tokens";

function ruleBasedSuggestions({ weakAreas }) {
  const sorted = Object.entries(weakAreas)
    .filter(([k]) => getAllSubjects(C).find((s) => s.key === k))
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3);

  if (!sorted.length) {
    return [
      { title: "Düzenli tekrar", body: "Henüz veri yok. Bir-iki deneme gir, sana özel öneri oluşturalım.", color: C.textMuted },
    ];
  }
  return sorted.map(([key, pct]) => {
    const subj = getAllSubjects(C).find((s) => s.key === key) || { name: key, color: C.textMuted };
    const advice =
      pct < 30 ? "Temel kavramlardan başla, video + kitap karması işe yarar."
      : pct < 50 ? "Yeni konu çalışmadan önce eski denemelerindeki yanlışlarını tekrarla."
      : "Soru çözümünü artır — günde 20 soru hedefle.";
    return {
      title: `${subj.name} (%${pct})`,
      body: advice,
      color: subj.color,
      subjectKey: key,
    };
  });
}

export async function getAISuggestions(input) {
  return ruleBasedSuggestions(input);
}
