// Ana Sayfa'dan zamanlayiciya gecis parametreleri. Iki sekil gelir: planEngine
// gorevi (hero CTA: subject/topicLabel/planTaskKey/stopId) ya da birlesik durak
// satiri (id/source/label/routeStop). Ikisi de ayni plan/rota baglamini tasir.
export function buildStudyTimerParams(task) {
  if (!task) return null;
  const isMergedItem = task.source != null;
  const isPlan = isMergedItem ? task.source === "plan" : true;
  const planTaskKey = isMergedItem ? (isPlan ? task.id : undefined) : task.planTaskKey;
  const topicName = isMergedItem ? task.label : (task.topicLabel || task.subjectLabel);
  const planTopicName = isMergedItem ? task.planTopicName : task.topic;
  const stopId = isMergedItem ? task.routeStop?.stopId : (task.stopId || task.routeStopId);
  const version = isMergedItem ? task.routeStop?.version : task.version;

  return {
    taskId: isMergedItem ? task.id : planTaskKey,
    planTaskKey,
    subjectKey: task.subject,
    topicName,
    planSubjectKey: isPlan ? task.subject : undefined,
    planTopicName: isPlan ? (planTopicName ?? undefined) : undefined,
    routeStopId: stopId || undefined,
    routeStopVersion: stopId ? (version ?? undefined) : undefined,
  };
}
