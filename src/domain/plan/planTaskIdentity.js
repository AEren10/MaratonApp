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

export function mapRemotePlanTasks(dbTasks = [], generatedTasks = []) {
  const map = {};
  const doneIds = [];
  dbTasks.forEach((task) => {
    const key = buildPlanTaskKey(task.subject, task.topic);
    map[key] = task.id;
    if (task.completed) doneIds.push(key);
  });

  generatedTasks.forEach((task) => {
    const dbTask = dbTasks.find((row) =>
      row.subject === task.subject && normalizePlanTopic(row.topic) === normalizePlanTopic(task.topic)
    );
    if (!dbTask) return;
    const key = task.planTaskKey || buildPlanTaskKey(task);
    map[key] = dbTask.id;
    if (dbTask.completed) doneIds.push(key);
  });

  return { map, doneIds };
}
