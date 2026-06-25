export const FIELD_TO_TYPE = { sayisal: "say", ea: "ea", sozel: "soz", dil: "ea" };

export const TYT_SUBJECTS = [
  { key: "turkce", name: "Türkçe", max: 40 },
  { key: "matematik", name: "Matematik", max: 40 },
  { key: "fen", name: "Fen", max: 20 },
  { key: "sosyal", name: "Sosyal", max: 20 },
];

export const AYT_SUBJECTS_BY_TYPE = {
  say: [
    { key: "matematik", name: "AYT Matematik", max: 40 },
    { key: "fizik", name: "Fizik", max: 14 },
    { key: "kimya", name: "Kimya", max: 13 },
    { key: "biyoloji", name: "Biyoloji", max: 13 },
  ],
  ea: [
    { key: "matematik", name: "AYT Matematik", max: 40 },
    { key: "edebiyat", name: "Edebiyat", max: 24 },
    { key: "tarih1", name: "Tarih-1", max: 10 },
    { key: "cografya1", name: "Coğrafya-1", max: 6 },
  ],
  soz: [
    { key: "edebiyat", name: "Edebiyat", max: 24 },
    { key: "tarih1", name: "Tarih-1", max: 10 },
    { key: "cografya1", name: "Coğrafya-1", max: 6 },
    { key: "tarih2", name: "Tarih-2", max: 11 },
    { key: "cografya2", name: "Coğrafya-2", max: 11 },
    { key: "felsefe", name: "Felsefe", max: 12 },
    { key: "din", name: "Din", max: 6 },
  ],
};

export const SUBJECT_COLORS = {
  turkce: "blue", matematik: "amber", fen: "green", sosyal: "purple",
  fizik: "blue", kimya: "teal", biyoloji: "green",
  edebiyat: "pink", tarih1: "red", cografya1: "green", tarih2: "amber",
  cografya2: "teal", felsefe: "purple", din: "yellow",
};

export function calcNet(correct, wrong) {
  return Math.max(0, (parseInt(correct, 10) || 0) - (parseInt(wrong, 10) || 0) * 0.25);
}

export function initialFrom(subjects, source) {
  const out = {};
  const tk = source?.subjects || {};
  subjects.forEach((s) => {
    const data = tk[`tyt_${s.key}`] || tk[`ayt_${s.key}`] || {};
    out[s.key] = { c: String(data.correct || ""), w: String(data.wrong || "") };
  });
  return out;
}
