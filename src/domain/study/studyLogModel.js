function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toOptionalText(value) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function compact(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined));
}

function has(input, ...keys) {
  return keys.some((key) => Object.prototype.hasOwnProperty.call(input, key));
}

export function normalizeStudyLog(row = {}) {
  const questionCount = toNumber(row.questionCount ?? row.question_count);
  const correctCount = toNumber(row.correctCount ?? row.correct_count);
  const duration = toNumber(row.duration ?? row.duration_minutes);
  const notes = row.notes ?? row.note ?? null;

  return {
    ...row,
    questionCount,
    correctCount,
    duration,
    question_count: questionCount,
    correct_count: correctCount,
    duration_minutes: duration,
    note: notes,
    notes,
  };
}

export function toStudyLogRow(input = {}) {
  const notes = input.notes ?? input.note;
  return compact({
    user_id: input.user_id,
    subject: input.subject,
    topic: input.topic,
    question_count: has(input, "question_count", "questionCount")
      ? toNumber(input.question_count ?? input.questionCount)
      : undefined,
    correct_count: has(input, "correct_count", "correctCount")
      ? toNumber(input.correct_count ?? input.correctCount)
      : undefined,
    duration_minutes: has(input, "duration_minutes", "duration")
      ? toNumber(input.duration_minutes ?? input.duration)
      : undefined,
    study_date: input.study_date,
    notes: has(input, "notes", "note") ? toOptionalText(notes) : undefined,
    client_operation_id: input.client_operation_id ?? input.clientOperationId,
  });
}

export function studyLogFingerprint(input = {}) {
  const row = normalizeStudyLog(input);
  return [
    row.user_id || "",
    row.study_date || "",
    row.subject || "",
    row.topic || "",
    row.question_count || 0,
    row.correct_count || 0,
    row.duration_minutes || 0,
  ].join("|");
}
