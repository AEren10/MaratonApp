export const ADD_TASK_SUBJECTS = [
  { key: "turkce", name: "Türkçe" },
  { key: "matematik", name: "Matematik" },
  { key: "fizik", name: "Fizik" },
  { key: "kimya", name: "Kimya" },
  { key: "biyoloji", name: "Biyoloji" },
  { key: "tarih", name: "Tarih" },
];

export const ADD_TASK_DURATIONS = ["25 dk", "50 dk", "1,5 sa", "2 sa"];

export function parseDurationMinutes(label) {
  if (label.includes("1,5")) return 90;
  if (label.includes("2 sa")) return 120;
  const n = Number(String(label).replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 50;
}
