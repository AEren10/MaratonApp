// Each trial type defines its subject set.
// `key` is the subject's stable identifier used in DB.
// `parent` indicates TYT or AYT (used for analysis grouping).
// Color keys resolve at call time via C parameter — no stale captures.

export function getTYTSubjects(C) {
  return [
    { key: "tyt_turkce", name: "Türkçe", color: C.blue, icon: "bookOpen", max: 40, parent: "TYT" },
    { key: "tyt_matematik", name: "Matematik", color: C.amber, icon: "hash", max: 40, parent: "TYT" },
    { key: "tyt_fen", name: "Fen Bilimleri", color: C.green, icon: "activity", max: 20, parent: "TYT" },
    { key: "tyt_sosyal", name: "Sosyal Bilimler", color: C.purple, icon: "layers", max: 20, parent: "TYT" },
  ];
}

export function getAYTSaySubjects(C) {
  return [
    { key: "ayt_matematik", name: "Matematik", color: C.amber, icon: "hash", max: 40, parent: "AYT" },
    { key: "ayt_fizik", name: "Fizik", color: C.blue, icon: "zap", max: 14, parent: "AYT" },
    { key: "ayt_kimya", name: "Kimya", color: C.teal, icon: "flask", max: 13, parent: "AYT" },
    { key: "ayt_biyoloji", name: "Biyoloji", color: C.green, icon: "activity", max: 13, parent: "AYT" },
  ];
}

export function getAYTEASubjects(C) {
  return [
    { key: "ayt_matematik", name: "Matematik", color: C.amber, icon: "hash", max: 40, parent: "AYT" },
    { key: "ayt_edebiyat", name: "Edebiyat", color: C.purple, icon: "bookOpen", max: 24, parent: "AYT" },
    { key: "ayt_tarih1", name: "Tarih-1", color: C.red, icon: "clock", max: 10, parent: "AYT" },
    { key: "ayt_cografya1", name: "Coğrafya-1", color: C.green, icon: "globe", max: 6, parent: "AYT" },
  ];
}

export function getAYTSozSubjects(C) {
  return [
    { key: "ayt_edebiyat", name: "Edebiyat", color: C.purple, icon: "bookOpen", max: 24, parent: "AYT" },
    { key: "ayt_tarih1", name: "Tarih-1", color: C.red, icon: "clock", max: 10, parent: "AYT" },
    { key: "ayt_cografya1", name: "Coğrafya-1", color: C.green, icon: "globe", max: 6, parent: "AYT" },
    { key: "ayt_tarih2", name: "Tarih-2", color: C.amber, icon: "clock", max: 11, parent: "AYT" },
    { key: "ayt_cografya2", name: "Coğrafya-2", color: C.teal, icon: "globe", max: 11, parent: "AYT" },
    { key: "ayt_felsefe", name: "Felsefe", color: C.blue, icon: "bookOpen", max: 12, parent: "AYT" },
    { key: "ayt_din", name: "Din Kültürü", color: C.yellow, icon: "bookOpen", max: 6, parent: "AYT" },
  ];
}

export function getAllSubjects(C) {
  return [
    ...getTYTSubjects(C),
    ...getAYTSaySubjects(C),
    ...getAYTEASubjects(C).filter((s) => s.key !== "ayt_matematik"),
    ...getAYTSozSubjects(C).filter(
      (s) => !["ayt_edebiyat", "ayt_tarih1", "ayt_cografya1"].includes(s.key)
    ),
  ];
}

export function getTrialTypes(C) {
  return {
    TYT: {
      code: "TYT",
      label: "TYT Denemesi",
      description: "120 soru · 4 ders",
      icon: "bookOpen",
      color: C.blue,
      subjects: getTYTSubjects(C),
      totalQuestions: 120,
    },
    AYT_SAY: {
      code: "AYT_SAY",
      label: "AYT Sayısal",
      description: "80 soru · Mat-Fizik-Kimya-Biyoloji",
      icon: "hash",
      color: C.amber,
      subjects: getAYTSaySubjects(C),
      totalQuestions: 80,
    },
    AYT_EA: {
      code: "AYT_EA",
      label: "AYT Eşit Ağırlık",
      description: "80 soru · Mat-Ede-Tarih-Coğ",
      icon: "layers",
      color: C.purple,
      subjects: getAYTEASubjects(C),
      totalQuestions: 80,
    },
    AYT_SOZ: {
      code: "AYT_SOZ",
      label: "AYT Sözel",
      description: "80 soru · Ede-Tarih-Coğ-Fel-Din",
      icon: "bookOpen",
      color: C.green,
      subjects: getAYTSozSubjects(C),
      totalQuestions: 80,
    },
    BRANCH: {
      code: "BRANCH",
      label: "Branş Denemesi",
      description: "Tek derslik branş denemesi",
      icon: "target",
      color: C.teal,
      subjects: getAllSubjects(C),
      totalQuestions: null,
    },
  };
}

export function getTrialTypeList(C) {
  return Object.values(getTrialTypes(C));
}

export function getTrialTypesForField(C, field) {
  const all = getTrialTypeList(C);
  if (!field) return all;
  if (field === "sayisal") return all.filter((t) => ["TYT", "AYT_SAY", "BRANCH"].includes(t.code));
  if (field === "ea") return all.filter((t) => ["TYT", "AYT_EA", "BRANCH"].includes(t.code));
  if (field === "sozel") return all.filter((t) => ["TYT", "AYT_SOZ", "BRANCH"].includes(t.code));
  if (field === "dil") return all.filter((t) => ["TYT", "BRANCH"].includes(t.code));
  return all;
}

export function getSubjectsForType(C, typeCode, branchSubjectKey = null) {
  const types = getTrialTypes(C);
  const type = types[typeCode];
  if (!type) return [];
  if (typeCode === "BRANCH") {
    if (!branchSubjectKey) return [];
    return getAllSubjects(C).filter((s) => s.key === branchSubjectKey);
  }
  return type.subjects;
}

export function getFieldFromType(typeCode) {
  if (typeCode === "AYT_SAY") return "Sayisal";
  if (typeCode === "AYT_EA") return "Esit Agirlik";
  if (typeCode === "AYT_SOZ") return "Sozel";
  return null;
}
