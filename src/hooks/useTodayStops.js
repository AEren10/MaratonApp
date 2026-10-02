import { useCallback, useEffect, useMemo, useRef } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useUserTasks } from "./useUserTasks";
import { usePlanCompletion } from "./usePlanCompletion";
import { buildPlanTaskKey } from "../domain/plan/planTaskIdentity";
import { getSubjectByKey } from "../themes/subjects";
import * as H from "../lib/haptics";
import { useStopCompletion } from "./useStopCompletion";
import { useStopRecordActions } from "./useStopRecordActions";
import { trackPlanAllCompletedOnce, trackPlanTaskCompleted } from "../lib/planAnalytics";

// Ana Sayfa "BUGÜNÜN DURAKLARI".
// Kullanıcı görevleri + rota/plan durakları + öneri tek listede; tamamlanan
// durak kaybolmaz, yeşil tikle alta iner ve sayaçla (2/5) senkron kalır.
export function useTodayStops({ generatedTasks = [], aiSuggestion, onRouteComplete, onRouteReopen, onAllDone }) {
  const { user } = useAuth();
  const stopLog = useStopCompletion();
  const record = useStopRecordActions();
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
    // Sira: once rotanin bugunku duraklari (ders programi sirasiyla; ana
    // buton ve ŞİMDİ karti da ilk acik rota duragini gosterir), sonra
    // kullanicinin ekledikleri, en son oneri.
    generatedTasks.forEach((t) => {
      const pid = t.planTaskKey || buildPlanTaskKey(t);
      const isDone = Boolean(t.completed || isPlanDone(pid));
      const minutes = t.minutes ?? t.estimatedMinutes ?? t.assignment?.estimatedMinutes ?? (t.questionCount ? Math.round(t.questionCount * 1.5) : 35);
      out.push({
        id: pid,
        subject: t.subject,
        subjectLabel: t.subjectLabel || t.subject,
        label: t.topicLabel || t.topic || t.subjectLabel,
        topic: t.topicLabel || t.topic || null,
        planTopicName: t.topic || null,
        count: t.questionCount || 0,
        minutes,
        completed: isDone,
        badge: t.badge,
        rkind: t.rkind,
        reason: t.reason || null,
        logicalStopKey: t.logicalStopKey || null,
        weeklyTopics: t.weeklyTopics || null,
        source: "plan",
        routeStop: t.stopId ? { stopId: t.stopId, version: t.version } : null,
      });
    });

    userTasks.forEach((t) => {
      if (t.subject === "__calendar") return;
      const subj = getSubjectByKey(t.subject);
      const minutes = t.targetMinutes ?? t.target_minutes ?? (t.questionCount ? Math.round(t.questionCount * 1.5) : 30);
      out.push({
        id: t.id,
        subject: t.subject,
        label: t.topic || subj?.label || t.subject,
        topic: t.topic || null,
        count: t.questionCount ?? t.question_count ?? 0,
        minutes,
        completed: t.completed,
        source: "user",
      });
    });

    if (aiSuggestion) {
      out.push({
        id: "ai_suggestion",
        subject: aiSuggestion.subjectKey,
        // Ic skor ("Matematik (%20)") kullaniciya gosterilmez.
        label: String(aiSuggestion.title || "").replace(/\s*\(%\d+\)/g, ""),
        count: 0,
        minutes: aiSuggestion.estimatedMinutes || 25,
        completed: isPlanDone("ai_suggestion"),
        badge: "Öneri",
        source: "ai",
      });
    }

    // Tamamlananları senkronize et; yeni duraklar ekleyerek listeyi sonsuz uzatma
    out.forEach((item) => {
      if (item.completed) {
        completedHistoryRef.current.set(item.id, true);
      } else if (completedHistoryRef.current.has(item.id)) {
        item.completed = true;
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

  // Geri alma: once rota (sunucu yalniz bugun bitenleri acar), basarirsa
  // kayit silinir. Tersi sirada sunucu reddederse kayit bosuna silinirdi.
  const reopen = useCallback(async (item) => {
    completedHistoryRef.current.delete(item.id);
    if (item.routeStop) {
      const res = await Promise.resolve(onRouteReopen?.(item.routeStop)).catch(() => null);
      if (res?.lifecycle_status !== "upcoming") {
        completedHistoryRef.current.set(item.id, true);
        record.undoFailed();
        return;
      }
    }
    if (isPlanDone(item.id)) togglePlan(item.id);
    if (user?.id) stopLog.undo(item);
  }, [isPlanDone, onRouteReopen, record, stopLog, togglePlan, user?.id]);

  const toggle = useCallback(async (item) => {
    // Bitmis rota/plan duragi onayla geri alinir (yanlislikla tik).
    if (item.completed && item.source !== "user") {
      record.confirmUndo(item, () => reopen(item));
      return;
    }
    H.select();
    const wasDone = !!item.completed;
    let taskSaved = true;
    if (item.source === "user") taskSaved = await toggleTask(item.id);
    else togglePlan(item.id);
    const logWrite = user?.id ? (wasDone ? stopLog.undo : stopLog.complete)(item) : null;

    if (!wasDone && item.source !== "user") {
      completedHistoryRef.current.set(item.id, { ...item, completed: true });
    } else {
      completedHistoryRef.current.delete(item.id);
    }

    if (item.routeStop && !wasDone) {
      try {
        await onRouteComplete?.(item.routeStop);
      } catch {
        taskSaved = false;
      }
    } else if (!wasDone && item.source !== "user") {
      taskSaved = Boolean(await logWrite);
    }

    if (!wasDone && taskSaved) {
      completedHistoryRef.current.set(item.id, { ...item, completed: true });
      if (item.source !== "user") trackPlanTaskCompleted(item, "home");
      const completedItems = items.map((candidate) => (
        candidate.id === item.id ? { ...candidate, completed: true } : candidate
      ));
      await trackPlanAllCompletedOnce(user?.id, completedItems, "home");
    }
  }, [items, stopLog, onRouteComplete, toggleTask, togglePlan, user?.id, record, reopen]);

  const doneCount = items.filter((t) => t.completed).length;
  const nextId = items.find((t) => !t.completed)?.id ?? null;

  return { items, doneCount, nextId, toggle, editRecord: record.openEdit };
}
