import { TRIAL_TO_CURRICULUM } from "../trial/trialKeyMap.js";

// Tik haritasi -> rota girdisi: { mufredatDersi: { konu: "YYYY-MM-DD" } }.
// Anahtardaki ders deneme anahtari olabilir (tyt_fen -> fizik/kimya/biyoloji);
// konu adlari dersler arasinda cakismadigi icin her aday derse yazilir,
// motor yalniz o dersin mufredatinda olan konuya bakar.
export function knownTopicsByKey(map = {}) {
  const out = {};
  for (const [key, value] of Object.entries(map || {})) {
    if (!value) continue;
    const idx = key.indexOf(":");
    if (idx < 0) continue;
    const subject = key.slice(0, idx);
    const topic = key.slice(idx + 1);
    if (!topic) continue;
    const date = typeof value === "string" ? value.slice(0, 10) : null;
    for (const s of TRIAL_TO_CURRICULUM[subject] || [subject]) {
      (out[s] = out[s] || {})[topic] = date;
    }
  }
  return out;
}
