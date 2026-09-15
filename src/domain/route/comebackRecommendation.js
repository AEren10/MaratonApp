function positiveRound(...values) {
  for (const value of values) {
    const rounded = Math.round(Number(value) || 0);
    if (rounded > 0) return rounded;
  }
  return 0;
}

function cleanLabel(...values) {
  return values.find((value) => typeof value === "string" && value.trim())?.trim() || null;
}

function effortLine(questions, minutes) {
  if (questions > 0 && minutes > 0) return `${questions} soru · ~${minutes} dk`;
  if (questions > 0) return `${questions} soru`;
  if (minutes > 0) return `~${minutes} dk`;
  return "Bugünkü plandan küçük bir adım";
}

export function buildComebackRecommendation(task = null) {
  const routeStop = task?.routeStop || null;
  const questions = positiveRound(
    task?.questionCount,
    task?.question_count,
    task?.questions,
    routeStop?.cost?.questions,
    routeStop?.questions,
  );
  const minutes = positiveRound(
    task?.estimatedMinutes,
    task?.estimated_minutes,
    task?.minutes,
    routeStop?.cost?.minutes,
    routeStop?.minutes,
  );
  const topic = cleanLabel(task?.topicLabel, task?.label, task?.topic, routeStop?.topic);
  const subject = cleanLabel(task?.subjectLabel, routeStop?.subjectLabel);
  const primary = minutes > 0
    ? { value: minutes, unit: "dk" }
    : questions > 0
      ? { value: questions, unit: "soru" }
      : { value: null, unit: null };

  return {
    ...primary,
    title: topic || "Bugünkü plana yumuşak dönüş",
    kicker: subject || "DÖNÜŞ DURAĞI",
    effort: effortLine(questions, minutes),
    primaryLabel: minutes > 0
      ? `${minutes} dakikayla başla`
      : questions > 0
        ? `${questions} soruyla başla`
        : "Küçük adımla başla",
    accessibilityLabel: topic
      ? `${topic} dönüş durağı ile başla`
      : "Küçük dönüş durağı ile başla",
  };
}
