// Domain-level trial catalog. UI code should import from here, not screens.

// Ders renkleri palet ders haritasindan okunur. Eskiden eski takma
// adlar (C.blue/C.teal...) kullaniliyordu; bunlar ders haritasina 1:1
// esleşmediği için Fizik Turkce'nin mavisiyle, Kimya Fizik'in
// turkuaziyla ciziliyordu. Haritada olmayan ders accent'e duser.
const S = (C, key) => C.subjects?.[key] || C.accent;

export function getTYTSubjects(C) {
  return [
    { key: "tyt_turkce", name: "Türkçe", color: S(C, "turkce"), icon: "bookOpen", max: 40, parent: "TYT" },
    { key: "tyt_matematik", name: "Matematik", color: S(C, "matematik"), icon: "hash", max: 40, parent: "TYT" },
    { key: "tyt_fen", name: "Fen Bilimleri", color: S(C, "fen"), icon: "activity", max: 20, parent: "TYT" },
    { key: "tyt_sosyal", name: "Sosyal Bilimler", color: S(C, "sosyal"), icon: "layers", max: 20, parent: "TYT" },
  ];
}

export function getAYTSaySubjects(C) {
  return [
    { key: "ayt_matematik", name: "Matematik", color: S(C, "matematik"), icon: "hash", max: 40, parent: "AYT" },
    { key: "ayt_fizik", name: "Fizik", color: S(C, "fizik"), icon: "zap", max: 14, parent: "AYT" },
    { key: "ayt_kimya", name: "Kimya", color: S(C, "kimya"), icon: "flask", max: 13, parent: "AYT" },
    { key: "ayt_biyoloji", name: "Biyoloji", color: S(C, "biyoloji"), icon: "activity", max: 13, parent: "AYT" },
  ];
}

export function getAYTEASubjects(C) {
  return [
    { key: "ayt_matematik", name: "Matematik", color: S(C, "matematik"), icon: "hash", max: 40, parent: "AYT" },
    { key: "ayt_edebiyat", name: "Edebiyat", color: S(C, "edebiyat"), icon: "bookOpen", max: 24, parent: "AYT" },
    { key: "ayt_tarih1", name: "Tarih-1", color: S(C, "tarih"), icon: "clock", max: 10, parent: "AYT" },
    { key: "ayt_cografya1", name: "Coğrafya-1", color: S(C, "cografya"), icon: "globe", max: 6, parent: "AYT" },
  ];
}

export function getAYTSozSubjects(C) {
  return [
    { key: "ayt_edebiyat", name: "Edebiyat", color: S(C, "edebiyat"), icon: "bookOpen", max: 24, parent: "AYT" },
    { key: "ayt_tarih1", name: "Tarih-1", color: S(C, "tarih"), icon: "clock", max: 10, parent: "AYT" },
    { key: "ayt_cografya1", name: "Coğrafya-1", color: S(C, "cografya"), icon: "globe", max: 6, parent: "AYT" },
    { key: "ayt_tarih2", name: "Tarih-2", color: S(C, "tarih"), icon: "clock", max: 11, parent: "AYT" },
    { key: "ayt_cografya2", name: "Coğrafya-2", color: S(C, "cografya"), icon: "globe", max: 11, parent: "AYT" },
    { key: "ayt_felsefe", name: "Felsefe", color: S(C, "felsefe"), icon: "bookOpen", max: 12, parent: "AYT" },
    { key: "ayt_din", name: "Din Kültürü", color: S(C, "din"), icon: "bookOpen", max: 6, parent: "AYT" },
  ];
}

export function getLGSSubjects(C) {
  return [
    { key: "lgs_turkce", name: "Türkçe", color: S(C, "turkce"), icon: "bookOpen", max: 20, parent: "LGS" },
    { key: "lgs_matematik", name: "Matematik", color: S(C, "matematik"), icon: "hash", max: 20, parent: "LGS" },
    { key: "lgs_fen", name: "Fen Bilimleri", color: S(C, "fen"), icon: "activity", max: 20, parent: "LGS" },
    { key: "lgs_inkilap", name: "T.C. İnkılap Tarihi", color: S(C, "inkilap"), icon: "clock", max: 10, parent: "LGS" },
    { key: "lgs_din", name: "Din Kültürü", color: S(C, "din"), icon: "bookOpen", max: 10, parent: "LGS" },
    { key: "lgs_ingilizce", name: "İngilizce", color: S(C, "ingilizce"), icon: "globe", max: 10, parent: "LGS" },
  ];
}

export function getAllSubjects(C) {
  return [
    ...getTYTSubjects(C),
    ...getAYTSaySubjects(C),
    ...getAYTEASubjects(C).filter((s) => s.key !== "ayt_matematik"),
    ...getAYTSozSubjects(C).filter((s) => !["ayt_edebiyat", "ayt_tarih1", "ayt_cografya1"].includes(s.key)),
    ...getLGSSubjects(C),
  ];
}

export function getTrialTypes(C) {
  return {
    TYT: { code: "TYT", label: "TYT Denemesi", description: "120 soru · 4 ders", icon: "bookOpen", color: C.blue, subjects: getTYTSubjects(C), totalQuestions: 120 },
    AYT_SAY: { code: "AYT_SAY", label: "AYT Sayısal", description: "80 soru · Mat-Fizik-Kimya-Biyoloji", icon: "hash", color: C.amber, subjects: getAYTSaySubjects(C), totalQuestions: 80 },
    AYT_EA: { code: "AYT_EA", label: "AYT Eşit Ağırlık", description: "80 soru · Mat-Ede-Tarih-Coğ", icon: "layers", color: C.purple, subjects: getAYTEASubjects(C), totalQuestions: 80 },
    AYT_SOZ: { code: "AYT_SOZ", label: "AYT Sözel", description: "80 soru · Ede-Tarih-Coğ-Fel-Din", icon: "bookOpen", color: C.green, subjects: getAYTSozSubjects(C), totalQuestions: 80 },
    LGS: { code: "LGS", label: "LGS Denemesi", description: "90 soru · 6 ders", icon: "shield", color: C.green, subjects: getLGSSubjects(C), totalQuestions: 90 },
    BRANCH: { code: "BRANCH", label: "Branş Denemesi", description: "Tek derslik branş denemesi", icon: "target", color: C.teal, subjects: getAllSubjects(C), totalQuestions: null },
  };
}

export function getTrialTypeList(C) {
  return Object.values(getTrialTypes(C));
}

export function getSubjectsForBranch(C, examType, field) {
  if (examType === "lgs") return getLGSSubjects(C);
  if (!examType) return getTYTSubjects(C);
  const subjects = [...getTYTSubjects(C)];
  if (examType === "tyt_ayt") {
    if (field === "sayisal") subjects.push(...getAYTSaySubjects(C));
    else if (field === "ea") subjects.push(...getAYTEASubjects(C));
    else if (field === "sozel") subjects.push(...getAYTSozSubjects(C));
  }
  return subjects;
}

export function getTrialTypesForExam(C, examType, field) {
  const all = getTrialTypeList(C);
  if (examType === "lgs") return all.filter((t) => ["LGS", "BRANCH"].includes(t.code));
  if (field === "sayisal") return all.filter((t) => ["TYT", "AYT_SAY", "BRANCH"].includes(t.code));
  if (field === "ea") return all.filter((t) => ["TYT", "AYT_EA", "BRANCH"].includes(t.code));
  if (field === "sozel") return all.filter((t) => ["TYT", "AYT_SOZ", "BRANCH"].includes(t.code));
  if (field === "dil") return all.filter((t) => ["TYT", "BRANCH"].includes(t.code));
  if (!field) return all.filter((t) => ["TYT", "BRANCH"].includes(t.code));
  return all;
}

export function getTrialTypesForField(C, field) {
  return getTrialTypesForExam(C, null, field);
}

export function getSubjectsForType(C, typeCode, branchSubjectKey = null) {
  const type = getTrialTypes(C)[typeCode];
  if (!type) return [];
  if (typeCode === "BRANCH") {
    if (!branchSubjectKey) return [];
    return getAllSubjects(C).filter((s) => s.key === branchSubjectKey);
  }
  return type.subjects;
}

export function getFieldFromType(typeCode) {
  if (typeCode === "AYT_SAY") return "Sayısal";
  if (typeCode === "AYT_EA") return "Eşit Ağırlık";
  if (typeCode === "AYT_SOZ") return "Sözel";
  return null;
}

