import { TYT_DERSLER, AYT_SAY_DERSLER, AYT_EA_DERSLER, AYT_SOZ_DERSLER, YDT_DERSLER, LGS_DERSLER, getSubjectsForExam } from "../data/curriculum";

export { getSubjectsForExam };

export const EXAM_TYPES = {
  TYT: "tyt",
  TYT_AYT: "tyt_ayt",
  DIL: "dil",
  LGS: "lgs",
};

// LGS_DERSLER BURADA OLMALI. Yoksa getSubjectByKey("lgs_matematik") null
// döner ve LGS kullanıcısı bugünkü plan, çalışma geçmişi, yanlış defteri,
// takvim ve konu seçicide ders adı yerine ham anahtar ("lgs_matematik") ile
// gri renk görür — 18'den fazla çağrı yeri etkileniyordu.
const ALL_SUBJECTS_MAP = {};
[...TYT_DERSLER, ...AYT_SAY_DERSLER, ...AYT_EA_DERSLER, ...AYT_SOZ_DERSLER, ...YDT_DERSLER, ...LGS_DERSLER].forEach((s) => {
  ALL_SUBJECTS_MAP[s.key] = s;
});

export const TYT_SUBJECTS = {};
TYT_DERSLER.forEach((s) => { TYT_SUBJECTS[s.key] = s; });

export const SUBJECT_LIST = TYT_DERSLER;

export const getSubjectByKey = (key) => ALL_SUBJECTS_MAP[key] || null;

export const getSubjectColor = (key) => ALL_SUBJECTS_MAP[key]?.color || "#9A9EAB";
