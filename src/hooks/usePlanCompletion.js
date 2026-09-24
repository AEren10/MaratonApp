import { useState, useEffect, useCallback, useRef } from "react";
import * as H from "../lib/haptics";
import { todayTR } from "../lib/dateUtils";
import { getDailyPlan } from "../supabase/plans";
import { savePlanTaskToggleOffline } from "../lib/offlineQueue";
import { STORAGE_KEYS, datedUserKey } from "../constants/storageKeys";
import { getJson, setJson } from "../lib/storage/appStorage";
import { useGamification } from "./useGamification";
import { mapRemotePlanTasks } from "../domain/plan/planTaskIdentity";
import { syncPlanRemote } from "../domain/plan/planRemoteSync";

const getKey = (userId) => datedUserKey(STORAGE_KEYS.PLAN_DONE_PREFIX, todayTR(), userId);
const getRewardedKey = (userId) => datedUserKey(STORAGE_KEYS.PLAN_REWARDED_PREFIX, todayTR(), userId);

export function usePlanCompletion(userId) {
  const { reward } = useGamification();
  const rewardRef = useRef(reward);
  rewardRef.current = reward;

  const [doneIds, setDoneIds] = useState(new Set());
  const doneIdsRef = useRef(doneIds);
  doneIdsRef.current = doneIds;
  const rewardedIdsRef = useRef(new Set());
  const taskMapRef = useRef({});
  const syncedRef = useRef(false);

  useEffect(() => {
    setDoneIds(new Set());
    rewardedIdsRef.current = new Set();
    taskMapRef.current = {};
    syncedRef.current = false;
    getJson(getKey(userId), []).then((ids) => {
      if (Array.isArray(ids)) {
        setDoneIds(new Set(ids));
        ids.forEach((id) => rewardedIdsRef.current.add(id));
      }
    });
    getJson(getRewardedKey(userId), []).then((ids) => {
      if (Array.isArray(ids)) {
        ids.forEach((id) => rewardedIdsRef.current.add(id));
      }
    });
  }, [userId]);

  useEffect(() => {
    if (!userId || userId === "dev") return;
    getDailyPlan(userId, todayTR()).then((dbPlan) => {
      if (!dbPlan?.plan_tasks?.length) return;
      syncedRef.current = true;
      const { map, doneIds: dbDoneIds } = mapRemotePlanTasks(dbPlan.plan_tasks);
      taskMapRef.current = map;
      if (dbDoneIds.length > 0) {
        dbDoneIds.forEach((id) => rewardedIdsRef.current.add(id));
        setDoneIds((prev) => {
          const merged = new Set([...prev, ...dbDoneIds]);
          setJson(getKey(userId), [...merged]);
          return merged;
        });
      }
    }).catch(() => {});
  }, [userId]);

  const syncPlan = useCallback((plan) => {
    return syncPlanRemote({ userId, plan, syncedRef, taskMapRef, setDoneIds, rewardedIdsRef });
  }, [userId]);

  // XP ödülü idempotenttir: aynı gün içinde her görev en fazla 1 kez XP verir.
  const toggle = useCallback((id) => {
    const current = doneIdsRef.current;
    const nowDone = !current.has(id);

    const next = new Set(current);
    if (nowDone) next.add(id);
    else next.delete(id);

    doneIdsRef.current = next;
    setDoneIds(next);

    if (nowDone) H.success();
    setJson(getKey(userId), [...next]);
    const dbId = taskMapRef.current[id];
    if (dbId) {
      savePlanTaskToggleOffline(dbId, nowDone, userId).catch(() => {});
    }
    if (nowDone && !rewardedIdsRef.current.has(id)) {
      rewardedIdsRef.current.add(id);
      setJson(getRewardedKey(userId), [...rewardedIdsRef.current]).catch(() => {});
      rewardRef.current?.("plan_task_done");
    }
  }, [userId]);

  const isDone = useCallback((id) => doneIds.has(id), [doneIds]);

  return { doneIds, isDone, toggle, syncPlan };
}
