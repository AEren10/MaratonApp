// Tasarimin zorluk secenekleri (Deneme Gir 1/3). Carpan sunucudaki
// trialDifficultyMultiplier ile ayni; burada yalniz gorunen etiket var.
export const TRIAL_DIFFICULTY_LEVELS = [
  { key: "easy", label: "ÖSYM'den kolay", factor: "×0,94" },
  { key: "standard", label: "ÖSYM ayarında", factor: "×1,00" },
  { key: "hard", label: "ÖSYM'den zor", factor: "×1,12" },
  { key: "very_hard", label: "Çok zor", factor: "×1,22" },
];

export function difficultyMeta(key) {
  return TRIAL_DIFFICULTY_LEVELS.find((level) => level.key === key) || TRIAL_DIFFICULTY_LEVELS[1];
}
