function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toNullableNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
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

export function normalizeUserTask(row = {}) {
  const questionCount = toNumber(row.questionCount ?? row.question_count);
  const targetMinutes = toNullableNumber(row.targetMinutes ?? row.target_minutes);

  return {
    ...row,
    questionCount,
    targetMinutes,
    question_count: questionCount,
    target_minutes: targetMinutes,
  };
}

export function toUserTaskRow(input = {}) {
  return compact({
    user_id: input.user_id,
    task_date: input.task_date,
    subject: input.subject,
    topic: has(input, "topic") ? toOptionalText(input.topic) : undefined,
    question_count: has(input, "question_count", "questionCount")
      ? toNumber(input.question_count ?? input.questionCount)
      : undefined,
    target_minutes: has(input, "target_minutes", "targetMinutes")
      ? toNullableNumber(input.target_minutes ?? input.targetMinutes)
      : undefined,
    note: has(input, "note") ? toOptionalText(input.note) : undefined,
    completed: input.completed == null ? undefined : Boolean(input.completed),
    client_operation_id: input.client_operation_id ?? input.clientOperationId,
  });
}

export function userTaskFingerprint(input = {}) {
  const task = normalizeUserTask(input);
  return [
    task.user_id || "",
    task.task_date || "",
    task.subject || "",
    task.topic || "",
    task.question_count || 0,
    task.target_minutes || 0,
    task.note || "",
  ].join("|");
}
