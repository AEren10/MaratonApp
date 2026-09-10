export function normalizePlanTopic(topic) {
  return String(topic || "genel").trim().toLocaleLowerCase("tr-TR") || "genel";
}

export function buildPlanTaskKey(taskOrSubject, maybeTopic = null) {
  const subject = typeof taskOrSubject === "string"
    ? taskOrSubject
    : taskOrSubject?.subject;
  const topic = typeof taskOrSubject === "string"
    ? maybeTopic
    : taskOrSubject?.logicalStopKey || taskOrSubject?.topic || taskOrSubject?.topicLabel;

  if (!subject && !topic) return "plan_genel";
  if (topic && String(topic).includes(":")) return `plan_${topic}`;
  return `plan_${subject || "genel"}_${normalizePlanTopic(topic)}`;
}

export function planTaskMatchesStudy({
  planSubject,
  planTopic,
  studySubject,
  studyTopic,
}) {
  if (!planSubject || !studySubject || planSubject !== studySubject) return false;
  if (planTopic == null || String(planTopic).trim() === "") return true;
  return normalizePlanTopic(planTopic) === normalizePlanTopic(studyTopic);
}

export function findPlanTaskByStudyContext(tasks = [], { subject, topic } = {}) {
  const normalizedTopic = normalizePlanTopic(topic);
  return (tasks || []).find((task) =>
    task?.subject === subject && normalizePlanTopic(task.topic) === normalizedTopic
  ) || null;
}
