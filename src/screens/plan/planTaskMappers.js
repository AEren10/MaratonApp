import { buildPlanTaskKey } from "../../domain/plan/planTaskIdentity.js";
import { getSubjectByKey } from "../../themes/subjects.js";

export function mapGeneratedTask(t, C, isPlanDone) {
  const pid = t.planTaskKey || buildPlanTaskKey(t);
  const subj = getSubjectByKey(t.subject);
  return {
    id: pid,
    s: subj || { key: t.subject, label: t.subjectLabel, color: t.color, icon: "bookOpen" },
    topic: t.topicLabel || "Genel çalışma",
    topicKey: t.topic,
    q: t.questionCount,
    minutes: t.minutes ?? t.estimatedMinutes ?? t.assignment?.estimatedMinutes ?? t.targetMinutes ?? t.target_minutes ?? ((t.questionCount || 0) * 2),
    reason: t.reason,
    rkind: t.rkind || "gray",
    assignment: t.assignment || null,
    done: Boolean(t.completed || (isPlanDone ? isPlanDone(pid) : false)),
    routeStop: t.stopId ? { stopId: t.stopId, version: t.version } : null,
    planTask: true,
    planSubjectKey: t.subject,
    planTopicName: t.topic || null,
  };
}

export function mapAdHocTask(t, C) {
  const subj = getSubjectByKey(t.subject);
  return {
    id: t.id,
    s: subj || { key: t.subject, label: t.subjectLabel, color: t.color || C?.amber, icon: "bookOpen" },
    topic: t.topic || "Genel çalışma",
    topicKey: t.topic,
    q: t.questionCount,
    minutes: t.minutes ?? t.estimatedMinutes ?? t.targetMinutes ?? t.target_minutes ?? ((t.questionCount || 0) * 2),
    reason: t.reason,
    rkind: "red",
    done: false,
    adHoc: true,
  };
}

export function mapUserTask(t, C) {
  const subj = getSubjectByKey(t.subject);
  return {
    id: t.id,
    s: subj || { key: t.subject, label: t.subject, color: C?.accent, icon: "bookOpen" },
    topic: t.topic || "Genel çalışma",
    topicKey: t.topic,
    q: t.questionCount ?? t.question_count ?? 0,
    minutes: t.minutes ?? t.targetMinutes ?? t.target_minutes ?? ((t.questionCount ?? t.question_count ?? 0) * 2),
    reason: t.note || "Senin eklediğin görev",
    rkind: "blue",
    done: t.completed,
    userTask: true,
  };
}
