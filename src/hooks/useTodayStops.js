import { useCallback, useEffect, useMemo, useRef } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { useUserTasks } from "./useUserTasks";
import { usePlanCompletion } from "./usePlanCompletion";
import { buildPlanTaskKey } from "../domain/plan/planTaskIdentity";
import { getSubjectByKey } from "../themes/subjects";
import * as H from "../lib/haptics";

// Ana Sayfa "BUGÜNÜN DURAKLARI". Eski TodayPlanCard'in veri tarafi: kullanici
// gorevleri + rota/plan duraklari + AI onerisi tek listede birlesir, plan
// sunucuya senkronlanir ve tum maddeler isaretlendiginde onAllDone BIR KEZ
// cagrilir (Gun Tamamlandi ani -> useCompletionMoments.markDayDone).
export function useTodayStops({ generatedTasks = [], aiSuggestion, onRouteComplete, onAllDone }) {
  const { user } = useAuth();
  const showAlert = useAlert();
  const { tasks: userTasks, toggleTask } = useUserTasks();
  const { isDone: isPlanDone, toggle: togglePlan, syncPlan } = usePlanCompletion(user?.id);
  const rewardedRef = useRef(false);
  const onAllDoneRef = useRef(onAllDone);
  onAllDoneRef.current = onAllDone;

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
      out.push({
        id: pid,
        subject: t.subject,
        label: t.topicLabel || t.subjectLabel,
        planTopicName: t.topic || null,
        count: t.questionCount || 0,
        completed: isPlanDone(pid),
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
    return out;
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
    if (item.routeStop && item.completed) return;
    if (item.routeStop) {
      try {
        await onRouteComplete?.(item.routeStop);
      } catch {
        showAlert("Durak tamamlanamadı", "Rota güncellenemedi. Bağlantını kontrol edip yeniden dene.");
        return;
      }
    }
    if (item.source === "user") toggleTask(item.id);
    else togglePlan(item.id);
  }, [onRouteComplete, showAlert, toggleTask, togglePlan]);

  const doneCount = items.filter((t) => t.completed).length;
  const nextId = items.find((t) => !t.completed)?.id ?? null;

  return { items, doneCount, nextId, toggle };
}
