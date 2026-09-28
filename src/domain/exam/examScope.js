// AKTIF SINAV KAPSAMI: bir deneme kullanicinin su anki sinavina ait mi?
//
// Sinav degistiren kullanicida (LGS -> YKS, Sayisal -> EA) eski denemeler
// Analiz "Tumu"ne, zayif alanlara ve gunluk plan onerilerine karisiyordu.
// Deneme kayitlari hic silinmez; yalniz bu hesaplardan elenir.
const AYT_BY_FIELD = { sayisal: "AYT_SAY", ea: "AYT_EA", sozel: "AYT_SOZ" };

export function examTrialTypes(examType, field) {
  if (examType === "lgs") return ["LGS"];
  if (examType === "tyt") return ["TYT"];
  if (examType === "dil") return ["TYT", "YDT"];
  if (examType === "tyt_ayt") {
    const ayt = AYT_BY_FIELD[field];
    // Eski kayitlarda tur yalniz "AYT" olabilir.
    return ayt ? ["TYT", ayt, "AYT"] : ["TYT", "AYT", "AYT_SAY", "AYT_EA", "AYT_SOZ"];
  }
  return null; // sinav bilinmiyor: eleme yapma
}

export function trialBelongsToExam(trial, examType, field) {
  const types = examTrialTypes(examType, field);
  if (!types) return true;
  const type = String(trial?.trialType || trial?.exam_type || "").toUpperCase();
  if (type === "BRANCH") {
    const lgsBranch = String(trial?.branchSubject || "").toLowerCase().startsWith("lgs_");
    return examType === "lgs" ? lgsBranch : !lgsBranch;
  }
  return types.includes(type);
}

export function examTrials(trials = [], examType, field) {
  return (trials || []).filter((t) => trialBelongsToExam(t, examType, field));
}
