import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as H from "../lib/haptics";
import { todayTR } from "../lib/dateUtils";
import { getDailyPlan, createDailyPlan, togglePlanTask } from "../supabase/plans";

const getKey = () => `@plan_done_${todayTR()}`;

function buildTaskKey(subject, topic) {
  return `plan_${subject}_${topic || "genel"}`;
}

export function usePlanCompletion(userId) {
  const [doneIds, setDoneIds] = useState(new Set());
  const taskMapRef = useRef({});
  const syncedRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(getKey()).then((val) => {
      if (val) {
        try { setDoneIds(new Set(JSON.parse(val))); } catch {}
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!userId || userId === "dev") return;
    getDailyPlan(userId, todayTR()).then((dbPlan) => {
      if (!dbPlan?.plan_tasks?.length) return;
      syncedRef.current = true;
      const map = {};
      const dbDoneIds = [];
      dbPlan.plan_tasks.forEach((t) => {
        const fid = buildTaskKey(t.subject, t.topic);
        map[fid] = t.id;
        if (t.completed) dbDoneIds.push(fid);
      });
      taskMapRef.current = map;
      if (dbDoneIds.length > 0) {
        setDoneIds((prev) => {
          const merged = new Set([...prev, ...dbDoneIds]);
          AsyncStorage.setItem(getKey(), JSON.stringify([...merged]));
          return merged;
        });
      }
    }).catch(() => {});
  }, [userId]);

  const syncPlan = useCallback(async (plan) => {
    if (!userId || userId === "dev" || syncedRef.current) return;
    if (!plan?.tasks?.length) return;
    syncedRef.current = true;
    try {
      let dbPlan = await getDailyPlan(userId, todayTR());
      if (!dbPlan) {
        dbPlan = await createDailyPlan(
          {
            user_id: userId,
            plan_date: todayTR(),
            total_questions: plan.totalQuestions,
            estimated_minutes: plan.estimatedMinutes,
          },
          plan.tasks.map((t, i) => ({
            subject: t.subject,
            topic: t.topic || null,
            question_count: t.questionCount,
            priority: t.priority || i + 1,
            reason: t.reason || null,
            completed: false,
          })),
        );
      }
      if (dbPlan?.plan_tasks) {
        const map = {};
        dbPlan.plan_tasks.forEach((t) => {
          map[buildTaskKey(t.subject, t.topic)] = t.id;
        });
        taskMapRef.current = map;
      }
    } catch {
      syncedRef.current = false;
    }
  }, [userId]);

  const toggle = useCallback((id) => {
    setDoneIds((prev) => {
      const next = new Set(prev);
      const nowDone = !next.has(id);
      if (nowDone) { next.add(id); H.success(); }
      else next.delete(id);
      AsyncStorage.setItem(getKey(), JSON.stringify([...next]));
      const dbId = taskMapRef.current[id];
      if (dbId) togglePlanTask(dbId, nowDone).catch(() => {});
      return next;
    });
  }, []);

  const isDone = useCallback((id) => doneIds.has(id), [doneIds]);

  return { doneIds, isDone, toggle, syncPlan };
}
