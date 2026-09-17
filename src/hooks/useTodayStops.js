import { useCallback, useEffect, useMemo, useRef } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { useUserTasks } from "./useUserTasks";
import { usePlanCompletion } from "./usePlanCompletion";
import { buildPlanTaskKey } from "../domain/plan/planTaskIdentity";
import { getSubjectByKey } from "../themes/subjects";
import * as H from "../lib/haptics";

// Ana Sayfa "BUGÜNÜN DURAKLARI".
// Kullanıcı görevleri + rota/plan durakları + AI önerisi tek listede birleşir.
// Tamamlanan duraklar kaybolmaz; motive edici şekilde yeşil tikle listenin
// altına iner ve sayaçla (örn. 2/5) tam senkronize kalır.
export function useTodayStops({ generatedTasks = [], aiSuggestion, onRouteComplete, onAllDone }) {
  const { user } = useAuth();
  const showAlert = useAlert();
  const { tasks: userTasks, toggleTask } = useUserTasks();
  const { isDone: isPlanDone, toggle: togglePlan, syncPlan } = usePlanCompletion(user?.id);
  const rewardedRef = useRef(false);
  const onAllDoneRef = useRef(onAllDone);
  onAllDoneRef.current = onAllDone;
  const completedHistoryRef = useRef(new Map());

  useEffect(() => {
    if (!generatedTasks.length) return;
    const totalQuestions = generatedTasks.reduce((sum, task) => sum + (task.questionCount || 0), 0);
    syncPlan({
      tasks: generatedTasks,
      totalQuestions,
      estimatedMinutes: Math.round((totalQuestions / 80) * 120),
    });
  }, [generatedTasks, syncPlan]);

  const items = useMemo(() => {
    const out = [];
    userTasks.forEach((t) => {
      const subj = getSubjectByKey(t.subject);
      out.push({
        id: t.id,
        subject: t.subject,
        label: t.topic || subj?.label || t.subject,
        count: t.questionCount ?? t.question_count ?? 0,
        completed: t.completed,
        source: "user",
      });
    });

    generatedTasks.forEach((t) => {
      const pid = t.planTaskKey || buildPlanTaskKey(t);
      const isDone = isPlanDone(pid);
      out.push({
        id: pid,
        subject: t.subject,
        label: t.topicLabel || t.subjectLabel,
        planTopicName: t.topic || null,
        count: t.questionCount || 0,
        completed: isDone,
        badge: t.badge,
        rkind: t.rkind,
        source: "plan",
        routeStop: t.stopId ? { stopId: t.stopId, version: t.version } : null,
      });
    });

    if (aiSuggestion) {
      out.push({
        id: "ai_suggestion",
        subject: aiSuggestion.subjectKey,
        label: aiSuggestion.title,
        count: 0,
        completed: isPlanDone("ai_suggestion"),
        source: "ai",
      });
    }

    // Tamamlananları havuzda sakla; rota yeniden çizilse bile bugün bitirilen durak kaybolmasın
    out.forEach((item) => {
      if (item.completed) {
        completedHistoryRef.current.set(item.id, item);
      }
    });

    completedHistoryRef.current.forEach((cachedItem, id) => {
      if (!out.some((t) => t.id === id)) {
        out.push({ ...cachedItem, completed: true });
      }
    });

    // Sırada bekleyenler önce, tamamlananlar listenin altında (motivasyon için)
    return out.sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  }, [generatedTasks, userTasks, aiSuggestion, isPlanDone]);

  useEffect(() => {
    if (items.length === 0 || rewardedRef.current) return;
    if (items.every((t) => t.completed)) {
      rewardedRef.current = true;
      onAllDoneRef.current?.(items);
    }
  }, [items]);

  const toggle = useCallback(async (item) => {
    H.select();
    const wasDone = item.completed;
    if (item.source === "user") toggleTask(item.id);
    else togglePlan(item.id);

    if (!wasDone) {
      completedHistoryRef.current.set(item.id, { ...item, completed: true });
    } else {
      completedHistoryRef.current.delete(item.id);
    }

    if (item.routeStop && !wasDone) {
      try {
        await onRouteComplete?.(item.routeStop);
      } catch {}
    }
  }, [onRouteComplete, toggleTask, togglePlan]);

  const doneCount = items.filter((t) => t.completed).length;
  const nextId = items.find((t) => !t.completed)?.id ?? null;

  return { items, doneCount, nextId, toggle };
}
