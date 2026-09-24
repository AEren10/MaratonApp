import { TYT_DERSLER, AYT_SAY_DERSLER, AYT_EA_DERSLER, AYT_SOZ_DERSLER, YDT_DERSLER, LGS_DERSLER, getSubjectsForExam } from "../data/curriculum.js";

export { getSubjectsForExam };

export const EXAM_TYPES = {
  TYT: "tyt",
  TYT_AYT: "tyt_ayt",
  DIL: "dil",
  LGS: "lgs",
};

const TRIAL_SUBJECT_ALIASES = {
  tyt_turkce: { key: "tyt_turkce", label: "Türkçe", name: "Türkçe", exam: "tyt", icon: "bookOpen" },
  tyt_matematik: { key: "tyt_matematik", label: "Matematik", name: "Matematik", exam: "tyt", icon: "hash" },
  tyt_fen: { key: "tyt_fen", label: "Fen Bilimleri", name: "Fen Bilimleri", exam: "tyt", icon: "zap" },
  tyt_sosyal: { key: "tyt_sosyal", label: "Sosyal Bilimler", name: "Sosyal Bilimler", exam: "tyt", icon: "layers" },
  ayt_matematik: { key: "ayt_matematik", label: "Matematik", name: "Matematik", exam: "ayt", icon: "hash" },
  ayt_fizik: { key: "ayt_fizik", label: "Fizik", name: "Fizik", exam: "ayt", icon: "zap" },
  ayt_kimya: { key: "ayt_kimya", label: "Kimya", name: "Kimya", exam: "ayt", icon: "flask" },
  ayt_biyoloji: { key: "ayt_biyoloji", label: "Biyoloji", name: "Biyoloji", exam: "ayt", icon: "heart" },
  ayt_edebiyat: { key: "ayt_edebiyat", label: "Edebiyat", name: "Edebiyat", exam: "ayt", icon: "bookOpen" },
  ayt_tarih1: { key: "ayt_tarih1", label: "Tarih-1", name: "Tarih-1", exam: "ayt", icon: "clock" },
  ayt_cografya1: { key: "ayt_cografya1", label: "Coğrafya-1", name: "Coğrafya-1", exam: "ayt", icon: "globe" },
  ayt_tarih2: { key: "ayt_tarih2", label: "Tarih-2", name: "Tarih-2", exam: "ayt", icon: "clock" },
  ayt_cografya2: { key: "ayt_cografya2", label: "Coğrafya-2", name: "Coğrafya-2", exam: "ayt", icon: "globe" },
  ayt_felsefe: { key: "ayt_felsefe", label: "Felsefe", name: "Felsefe", exam: "ayt", icon: "layers" },
  ayt_din: { key: "ayt_din", label: "Din Kültürü", name: "Din Kültürü", exam: "ayt", icon: "star" },
  ayt_ea_matematik: { key: "ayt_ea_matematik", label: "Matematik", name: "Matematik", exam: "ayt", icon: "hash" },
  ayt_tarih_ea: { key: "ayt_tarih_ea", label: "Tarih", name: "Tarih", exam: "ayt", icon: "clock" },
  ayt_cografya_ea: { key: "ayt_cografya_ea", label: "Coğrafya", name: "Coğrafya", exam: "ayt", icon: "globe" },
  ayt_edebiyat_soz: { key: "ayt_edebiyat_soz", label: "Edebiyat", name: "Edebiyat", exam: "ayt", icon: "bookOpen" },
  ayt_tarih_soz: { key: "ayt_tarih_soz", label: "Tarih", name: "Tarih", exam: "ayt", icon: "clock" },
  ayt_cografya_soz: { key: "ayt_cografya_soz", label: "Coğrafya", name: "Coğrafya", exam: "ayt", icon: "globe" },
  ayt_felsefe_soz: { key: "ayt_felsefe_soz", label: "Felsefe Grubu", name: "Felsefe Grubu", exam: "ayt", icon: "layers" },
  lgs_turkce: { key: "lgs_turkce", label: "Türkçe", name: "Türkçe", exam: "lgs", icon: "bookOpen" },
  lgs_matematik: { key: "lgs_matematik", label: "Matematik", name: "Matematik", exam: "lgs", icon: "hash" },
  lgs_fen: { key: "lgs_fen", label: "Fen Bilimleri", name: "Fen Bilimleri", exam: "lgs", icon: "zap" },
  lgs_inkilap: { key: "lgs_inkilap", label: "İnkılap Tarihi", name: "İnkılap Tarihi", exam: "lgs", icon: "clock" },
  lgs_din: { key: "lgs_din", label: "Din Kültürü", name: "Din Kültürü", exam: "lgs", icon: "star" },
  lgs_ingilizce: { key: "lgs_ingilizce", label: "İngilizce", name: "İngilizce", exam: "lgs", icon: "globe" },
  ydt_ingilizce: { key: "ydt_ingilizce", label: "İngilizce", name: "İngilizce", exam: "ydt", icon: "globe" },
};

const ALL_SUBJECTS_MAP = {};
[...TYT_DERSLER, ...AYT_SAY_DERSLER, ...AYT_EA_DERSLER, ...AYT_SOZ_DERSLER, ...YDT_DERSLER, ...LGS_DERSLER].forEach((s) => {
  ALL_SUBJECTS_MAP[s.key] = { ...s, name: s.label || s.name, label: s.label || s.name };
});

Object.entries(TRIAL_SUBJECT_ALIASES).forEach(([k, s]) => {
  if (!ALL_SUBJECTS_MAP[k]) {
    ALL_SUBJECTS_MAP[k] = s;
  }
});

export const TYT_SUBJECTS = {};
TYT_DERSLER.forEach((s) => { TYT_SUBJECTS[s.key] = s; });

export const SUBJECT_LIST = TYT_DERSLER;

export const getSubjectByKey = (key) => {
  if (!key) return null;
  if (ALL_SUBJECTS_MAP[key]) return ALL_SUBJECTS_MAP[key];
  const stripped = String(key).replace(/^(tyt|ayt|lgs|ydt)_/, "").replace(/\d+$/, "");
  return ALL_SUBJECTS_MAP[stripped] || null;
};

export const getSubjectColor = (key) => ALL_SUBJECTS_MAP[key]?.color || "#9A9EAB";

export function getSubjectLabel(key) {
  if (!key) return "";
  const found = getSubjectByKey(key);
  if (found?.label || found?.name) return found.label || found.name;
  const clean = String(key).replace(/^(tyt|ayt|lgs|ydt)_/, "").replace(/\d+$/, "");
  return clean.charAt(0).toLocaleUpperCase("tr-TR") + clean.slice(1);
}

export function getSubjectBadge(nameOrKey = "") {
  if (!nameOrKey) return "";
  const text = getSubjectLabel(nameOrKey) || String(nameOrKey);
  const clean = text.trim().toLocaleUpperCase("tr-TR");
  if (clean.startsWith("TÜRK") || clean === "TÜRKÇE") return "TR";
  if (clean.startsWith("MAT")) return "MAT";
  if (clean.startsWith("FİZ")) return "FİZ";
  if (clean.startsWith("KİM")) return "KİM";
  if (clean.startsWith("BİY")) return "BİY";
  if (clean.startsWith("TAR")) return "TAR";
  if (clean.startsWith("COĞ")) return "COĞ";
  if (clean.startsWith("FEL")) return "FEL";
  if (clean.startsWith("DİN")) return "DİN";
  if (clean.startsWith("GEO") || clean.startsWith("GEOM")) return "GEO";
  if (clean.startsWith("İNG")) return "İNG";
  if (clean.startsWith("İNK")) return "İNK";
  if (clean.startsWith("EDE")) return "EDE";
  return clean.slice(0, 3);
}
