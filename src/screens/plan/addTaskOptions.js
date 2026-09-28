import {
  TYT_DERSLER,
  AYT_SAY_DERSLER,
  AYT_EA_DERSLER,
  AYT_SOZ_DERSLER,
  YDT_DERSLER,
  LGS_DERSLER,
  getAllSubjectsFlat,
} from "../../data/curriculum.js";

const toOption = (s) => ({ key: s.key, name: s.label, topics: s.topics || [] });
const AYT_BY_FIELD = { sayisal: AYT_SAY_DERSLER, ea: AYT_EA_DERSLER, sozel: AYT_SOZ_DERSLER };

// Durak ekle ders listesi KULLANICININ sinavina ve alanina gore. Eskiden AYT
// sekmesi uc alanin derslerini birlestiriyordu: YDT secen ogrenci Fizik
// goruyordu, Matematik/Tarih/Edebiyat ikiser kez cikiyordu.
export function addTaskSubjectGroups(examType, field) {
  if (examType === "lgs") return [{ key: "lgs", label: "LGS", subjects: LGS_DERSLER.map(toOption) }];
  const tyt = { key: "tyt", label: "TYT", subjects: TYT_DERSLER.map(toOption) };
  if (examType === "tyt") return [tyt];
  if (examType === "dil") return [tyt, { key: "ydt", label: "YDT", subjects: YDT_DERSLER.map(toOption) }];
  const ayt = AYT_BY_FIELD[field] || AYT_SAY_DERSLER;
  return [tyt, { key: "ayt", label: "AYT", subjects: ayt.map(toOption) }];
}

export function getTopicsForSubject(subjectKey) {
  const all = getAllSubjectsFlat();
  const found = all.find((s) => s.key === subjectKey);
  return found?.topics || [];
}

export const ADD_TASK_DURATIONS = ["25 dk", "50 dk", "1,5 sa", "2 sa", "Belirtme"];

export function parseDurationMinutes(label) {
  if (!label || label === "Belirtme") return null;
  if (label.includes("1,5")) return 90;
  if (label.includes("2 sa")) return 120;
  const n = Number(String(label).replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}
