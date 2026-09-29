import { TRIAL_TO_CURRICULUM } from "../trial/trialKeyMap.js";

// DENEMEDEN DERS AGIRLIGI -- orantili.
//
// Eskiden son denemelerin "en zayif 3 dersi" secilip hepsine ayni x1,35
// carpan veriliyordu: 5 net geride olan ders ile 20 net geride olan ders
// ayni muameleyi goruyordu, 4. zayif ders hic gormuyordu. Ustelik basari
// yalniz isaretlenen sorulardan (dogru / dogru+yanlis) hesaplaniyordu;
// 30 sorusunu bos birakip 10'unu dogru yapan "guclu" gorunuyordu.
//
// Basari = dogru / (dogru + yanlis + bos). Son 3 deneme 0.5/0.3/0.2
// agirlikla. Carpan: basari %75 ve ustu -> 1 (dokunma), %0 -> 1.6.

const WEIGHTS = [0.5, 0.3, 0.2];
const COMFORT = 0.75;
const MAX_BOOST = 0.6;

export function subjectSuccess(subjectsMap = {}) {
  const out = {};
  for (const [trialKey, data] of Object.entries(subjectsMap || {})) {
    const targets = TRIAL_TO_CURRICULUM[trialKey];
    if (!targets?.length) continue;
    const correct = Number(data?.correct ?? data?.correct_count) || 0;
    const wrong = Number(data?.wrong ?? data?.wrong_count) || 0;
    const empty = Number(data?.empty ?? data?.empty_count) || 0;
    const total = correct + wrong + empty;
    if (total === 0) continue;
    const rate = correct / total;
    targets.forEach((key) => { out[key] = out[key] == null ? rate : (out[key] + rate) / 2; });
  }
  return out;
}

/** trials: yeniden eskiye. @returns { [curriculumKey]: carpan 1..1.6 } */
export function subjectWeaknessFactors(trials = []) {
  const acc = {};
  (trials || []).slice(0, WEIGHTS.length).forEach((trial, i) => {
    for (const [key, rate] of Object.entries(subjectSuccess(trial?.subjects))) {
      acc[key] = acc[key] || { sum: 0, w: 0 };
      acc[key].sum += rate * WEIGHTS[i];
      acc[key].w += WEIGHTS[i];
    }
  });
  const out = {};
  for (const [key, { sum, w }] of Object.entries(acc)) {
    const rate = w > 0 ? sum / w : COMFORT;
    const gap = Math.min(1, Math.max(0, (COMFORT - rate) / COMFORT));
    out[key] = Math.round((1 + MAX_BOOST * gap) * 100) / 100;
  }
  return out;
}
