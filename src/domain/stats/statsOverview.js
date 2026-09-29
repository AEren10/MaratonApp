import { examTrials } from "../exam/examScope.js";

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const normalizeWeek = (week) => {
  if (!week) return null;
  return {
    weekStart: week.week_start ?? week.weekStart ?? null,
    questions: toNumber(week.questions) ?? 0,
    minutes: toNumber(week.minutes) ?? 0,
  };
};

const normalizeStudy = (totals) => {
  const totalQuestions = toNumber(totals?.total_questions ?? totals?.totalQuestions);
  const totalMinutes = toNumber(totals?.total_minutes ?? totals?.totalMinutes);
  const activeDays = toNumber(totals?.active_days ?? totals?.activeDays);
  const hasData = totals?.has_data ?? Boolean(totalQuestions || totalMinutes || activeDays);
  if (!hasData) return null;
  return {
    totalQuestions,
    totalMinutes,
    activeDays,
    subjects: (totals.subjects || []).map((row) => ({
      subject: row.subject,
      questions: toNumber(row.questions) ?? 0,
      minutes: toNumber(row.minutes) ?? 0,
    })),
    bestWeek: normalizeWeek(totals.best_week ?? totals.bestWeek),
    last8Weeks: (totals.last_8_weeks ?? totals.weeklyTotals ?? []).map(normalizeWeek).filter(Boolean),
  };
};

const trialType = (trial) => String(trial?.trialType || trial?.exam_type || "").toUpperCase();

const normalizeTrial = (trial) => ({
  ...trial,
  trialType: trialType(trial),
  branchSubject: trial?.branchSubject ?? trial?.branch_subject ?? null,
  totalNet: toNumber(trial?.totalNet ?? trial?.total_net),
});

function summarizeTrials(trials, examType, field) {
  const scoped = examTrials((trials || []).map(normalizeTrial), examType, field)
    .filter((trial) => trial.totalNet != null);
  if (!scoped.length) return null;

  const byType = new Map();
  for (const trial of scoped) {
    const key = trial.trialType || "UNKNOWN";
    const current = byType.get(key) || { examType: key, count: 0, bestNet: null };
    current.count += 1;
    current.bestNet = current.bestNet == null ? trial.totalNet : Math.max(current.bestNet, trial.totalNet);
    byType.set(key, current);
  }

  const bestByType = [...byType.values()].sort((a, b) => a.examType.localeCompare(b.examType));
  return {
    count: scoped.length,
    bestNet: Math.max(...scoped.map((trial) => trial.totalNet)),
    bestByType,
  };
}

function normalizeServerTrials(totals) {
  const count = toNumber(totals?.trial_count ?? totals?.trialCount);
  const rows = totals?.best_net_by_type ?? totals?.bestNetByType ?? [];
  const bestByType = (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      examType: String(row.exam_type ?? row.examType ?? "").toUpperCase(),
      count: toNumber(row.count) ?? null,
      bestNet: toNumber(row.best_net ?? row.bestNet),
    }))
    .filter((row) => row.examType && row.bestNet != null)
    .sort((a, b) => a.examType.localeCompare(b.examType));
  if (!count && !bestByType.length) return null;
  const bestNet = bestByType.length ? Math.max(...bestByType.map((row) => row.bestNet)) : null;
  return { count, bestNet, bestByType };
}

export function statsOverview({ studyTotals = null, trials = [], examType = null, field = null } = {}) {
  const study = normalizeStudy(studyTotals);
  const trialStats = normalizeServerTrials(studyTotals) || summarizeTrials(trials, examType, field);
  if (!study && !trialStats) return null;
  return { study, trials: trialStats };
}
