// Maps trial subject keys to curriculum subject keys.
// Used to feed trial results into the study plan engine.

export const TRIAL_TO_CURRICULUM = {
  tyt_turkce: ["turkce"],
  tyt_matematik: ["matematik"],
  tyt_fen: ["fizik", "kimya", "biyoloji"],
  tyt_sosyal: ["tarih", "cografya", "felsefe", "din"],

  ayt_matematik: ["ayt_matematik", "ayt_ea_matematik"],
  ayt_fizik: ["ayt_fizik"],
  ayt_kimya: ["ayt_kimya"],
  ayt_biyoloji: ["ayt_biyoloji"],

  ayt_edebiyat: ["ayt_edebiyat", "ayt_edebiyat_soz"],
  ayt_tarih1: ["ayt_tarih_ea", "ayt_tarih_soz"],
  ayt_cografya1: ["ayt_cografya_ea", "ayt_cografya_soz"],
  ayt_tarih2: ["ayt_tarih_soz"],
  ayt_cografya2: ["ayt_cografya_soz"],
  ayt_felsefe: ["ayt_felsefe_soz"],
  ayt_din: [],
};

export function trialSubjectsToCurriculumWeakAreas(subjectsMap) {
  const weak = {};
  Object.entries(subjectsMap || {}).forEach(([trialKey, data]) => {
    const targets = TRIAL_TO_CURRICULUM[trialKey];
    if (!targets || !targets.length) return;
    const total = (data.correct || 0) + (data.wrong || 0);
    if (total === 0) return;
    const acc = Math.round(((data.correct || 0) / total) * 100);
    targets.forEach((curriculumKey) => {
      // If multiple trial keys map to same curriculum key, average them
      if (weak[curriculumKey] !== undefined) {
        weak[curriculumKey] = Math.round((weak[curriculumKey] + acc) / 2);
      } else {
        weak[curriculumKey] = acc;
      }
    });
  });
  return weak;
}
