const TYPE_ALIASES = {
  tyt: "TYT", ayt: "AYT", ayt_say: "AYT_SAY", ayt_ea: "AYT_EA",
  ayt_soz: "AYT_SOZ", lgs: "LGS", branch: "BRANCH",
};

export const TRIAL_DIFFICULTY = Object.freeze({
  EASY: { level: "easy", multiplier: 0.94 },
  STANDARD: { level: "standard", multiplier: 1 },
  HARD: { level: "hard", multiplier: 1.12 },
  VERY_HARD: { level: "very_hard", multiplier: 1.22 },
});

export function trialDifficultyMultiplier(level) {
  return Object.values(TRIAL_DIFFICULTY)
    .find((item) => item.level === level)?.multiplier ?? 1;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function optionalNumber(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function normalizeTrialType(type) {
  if (!type) return "TYT";
  const key = String(type).trim();
  return TYPE_ALIASES[key.toLowerCase()] || key.toUpperCase();
}

export function wrongPenaltyForTrialType(type) {
  return normalizeTrialType(type) === "LGS" ? 1 / 3 : 0.25;
}

export function normalizeTrialSubject(row = {}, wrongPenalty = 0.25) {
  const penalty = toNumber(row.wrongPenalty ?? row.wrong_penalty, wrongPenalty);
  const correct = toNumber(row.correct ?? row.correct_count);
  const wrong = toNumber(row.wrong ?? row.wrong_count);
  const net = row.net == null ? correct - wrong * penalty : toNumber(row.net);
  const empty = toNumber(row.empty ?? row.empty_count);
  return {
    ...row, correct, wrong, net, empty, wrongPenalty: penalty,
    wrong_penalty: penalty, correct_count: correct,
    wrong_count: wrong, empty_count: empty,
  };
}

export function normalizeTrial(row = {}) {
  const trialType = normalizeTrialType(row.trialType ?? row.exam_type);
  const wrongPenalty = wrongPenaltyForTrialType(trialType);
  const subjects = Object.fromEntries(Object.entries(row.subjects || {}).map(
    ([key, value]) => [key, normalizeTrialSubject(value, wrongPenalty)],
  ));
  (row.trial_subjects || []).forEach((subjectRow) => {
    subjects[subjectRow.subject] = normalizeTrialSubject({
      ...subjectRow,
      net: subjectRow.correct_count - subjectRow.wrong_count * wrongPenalty,
    }, wrongPenalty);
  });
  const rawTotalNet = toNumber(
    row.rawTotalNet ?? row.raw_total_net ?? row.totalNet ?? row.total_net,
  );
  const difficultyMultiplier = optionalNumber(
    row.difficultyMultiplier ?? row.difficulty_multiplier
      ?? row.difficulty_factor_snapshot,
  ) ?? 1;
  const normalizedTotalNet = optionalNumber(
    row.normalizedTotalNet ?? row.normalized_total_net,
  ) ?? Math.round(rawTotalNet * difficultyMultiplier * 100) / 100;
  const publisherId = row.publisherId ?? row.publisher_id ?? null;
  const publisherName = row.publisherNameSnapshot ?? row.publisher_name_snapshot ?? null;
  const difficultyLevel = row.difficultyLevel ?? row.difficulty_level
    ?? row.difficulty_band ?? "standard";
  const version = row.normalizationVersion ?? row.normalization_version ?? 1;
  const confidence = row.normalizationConfidence
    ?? row.normalization_confidence ?? "self_reported";
  return {
    ...row, date: row.date || row.trial_date,
    trial_date: row.trial_date || row.date,
    totalNet: rawTotalNet, total_net: rawTotalNet,
    rawTotalNet, raw_total_net: rawTotalNet,
    normalizedTotalNet, normalized_total_net: normalizedTotalNet,
    publisherId, publisher_id: publisherId,
    publisherNameSnapshot: publisherName, publisher_name_snapshot: publisherName,
    difficultyLevel, difficulty_level: difficultyLevel,
    difficultyMultiplier, difficulty_multiplier: difficultyMultiplier,
    normalizationVersion: version, normalization_version: version,
    normalizationConfidence: confidence, normalization_confidence: confidence,
    subjects, trialType, exam_type: trialType,
    branchSubject: row.branchSubject ?? row.branch_subject ?? null,
    branch_subject: row.branch_subject ?? row.branchSubject ?? null,
  };
}

export function toTrialRow(input = {}) {
  const trial = normalizeTrial(input);
  return {
    user_id: input.user_id, name: trial.name, trial_date: trial.trial_date,
    exam_type: trial.trialType, field: trial.field ?? null,
    branch_subject: trial.branch_subject, total_net: trial.totalNet,
    raw_total_net: trial.rawTotalNet, normalized_total_net: trial.normalizedTotalNet,
    publisher_id: trial.publisherId,
    publisher_name_snapshot: trial.publisherNameSnapshot,
    difficulty_level: trial.difficultyLevel,
    difficulty_multiplier: trial.difficultyMultiplier,
    normalization_version: trial.normalizationVersion,
    normalization_confidence: trial.normalizationConfidence,
    mood: trial.mood ?? null,
    client_operation_id: input.client_operation_id ?? input.clientOperationId,
  };
}

export function toTrialSubjectRows(subjects = [], trialType = "TYT") {
  const wrongPenalty = wrongPenaltyForTrialType(trialType);
  return subjects.map((subject) => {
    const value = normalizeTrialSubject(subject, wrongPenalty);
    return {
      subject: subject.subject, correct_count: value.correct_count,
      wrong_count: value.wrong_count, empty_count: value.empty_count,
      wrong_penalty: wrongPenalty,
    };
  });
}

export function trialFingerprint(trial = {}, subjects = []) {
  const normalized = normalizeTrial(trial);
  const subjectPart = toTrialSubjectRows(subjects, normalized.exam_type)
    .map((s) => `${s.subject}:${s.correct_count}:${s.wrong_count}:${s.empty_count}`)
    .join(",");
  return [normalized.user_id || "", normalized.trial_date || "",
    normalized.exam_type || "", normalized.branch_subject || "",
    normalized.name || "", normalized.total_net || 0, subjectPart].join("|");
}
