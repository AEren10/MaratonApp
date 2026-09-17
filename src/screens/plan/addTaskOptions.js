import {
  TYT_DERSLER,
  AYT_SAY_DERSLER,
  AYT_EA_DERSLER,
  AYT_SOZ_DERSLER,
  getAllSubjectsFlat,
} from "../../data/curriculum";

const aytMap = new Map();
[...AYT_SAY_DERSLER, ...AYT_EA_DERSLER, ...AYT_SOZ_DERSLER].forEach((s) => {
  if (!aytMap.has(s.key)) aytMap.set(s.key, s);
});

export const ADD_TASK_TYT_SUBJECTS = TYT_DERSLER.map((s) => ({
  key: s.key,
  name: s.label,
  topics: s.topics || [],
}));

export const ADD_TASK_AYT_SUBJECTS = Array.from(aytMap.values()).map((s) => ({
  key: s.key,
  name: s.label,
  topics: s.topics || [],
}));

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
