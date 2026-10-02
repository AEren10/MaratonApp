import { getSubjectByKey } from "../../themes/subjects";

const SUBJECT_DEFAULTS = {
  mat: { label: "Matematik", history: [14.0, 17.5, 20.0, 24.5], currentNet: 24.5, delta: 4.5, pct: 22, average: 19.0 },
  tur: { label: "Türkçe", history: [22.0, 25.0, 27.5, 31.0], currentNet: 31.0, delta: 3.5, pct: 13, average: 26.4 },
  fiz: { label: "Fizik", history: [4.0, 6.5, 8.0, 10.5], currentNet: 10.5, delta: 2.5, pct: 31, average: 7.2 },
  kim: { label: "Kimya", history: [5.0, 7.0, 9.0, 11.0], currentNet: 11.0, delta: 2.0, pct: 22, average: 8.0 },
  bio: { label: "Biyoloji", history: [6.0, 8.0, 10.5, 12.0], currentNet: 12.0, delta: 1.5, pct: 14, average: 9.1 },
  tar: { label: "Tarih", history: [3.0, 4.0, 4.5, 5.0], currentNet: 5.0, delta: 0.5, pct: 11, average: 4.1 },
  cog: { label: "Coğrafya", history: [3.0, 3.5, 4.5, 5.0], currentNet: 5.0, delta: 0.5, pct: 11, average: 4.0 },
};

export function extractTrialNetHistory(trials) {
  if (!trials?.length) return [];
  const sorted = [...trials]
    .filter((t) => Number.isFinite(Number(t?.totalNet ?? t?.total_net)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  return sorted.slice(-6).map((t, i) => ({
    label: `${i + 1}. Deneme`,
    net: Number(t.totalNet ?? t.total_net),
    date: t.date,
  }));
}

export function extractSubjectData(trials, subjectKey = "mat") {
  const fallback = SUBJECT_DEFAULTS[subjectKey] || SUBJECT_DEFAULTS.mat;
  if (!trials?.length) return { key: subjectKey, ...fallback };

  const sorted = [...trials].sort((a, b) => new Date(a.date) - new Date(b.date));
  const points = [];

  for (const t of sorted) {
    if (!t.subjects) continue;
    for (const [k, val] of Object.entries(t.subjects)) {
      const info = getSubjectByKey(k);
      const normKey = info?.key || k;
      if (normKey === subjectKey || k === subjectKey) {
        const net = Number(val?.net);
        if (Number.isFinite(net)) points.push(net);
      }
    }
  }

  if (points.length < 2) return { key: subjectKey, ...fallback };

  const history = points.slice(-5);
  const currentNet = history[history.length - 1];
  const prevNet = history[history.length - 2];
  const delta = currentNet - prevNet;
  const pct = prevNet > 0 ? Math.round((delta / prevNet) * 100) : 0;
  const avg = Number((history.reduce((a, b) => a + b, 0) / history.length).toFixed(1));
  const subjInfo = getSubjectByKey(subjectKey);

  return {
    key: subjectKey,
    label: subjInfo?.label || fallback.label,
    history,
    currentNet,
    delta,
    pct,
    average: avg,
  };
}
