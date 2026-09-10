import { useState, useEffect, useCallback, useRef } from "react";
import * as H from "../lib/haptics";
import { todayTR } from "../lib/dateUtils";
import { getDailyPlan, createDailyPlan, createPlanTasks } from "../supabase/plans";
import { savePlanTaskToggleOffline } from "../lib/offlineQueue";
import { STORAGE_KEYS, datedUserKey } from "../constants/storageKeys";
import { getJson, setJson } from "../lib/storage/appStorage";
import { useGamification } from "./useGamification";
import { buildPlanTaskKey, normalizePlanTopic } from "../domain/plan/planTaskIdentity";

const getKey = (userId) => datedUserKey(STORAGE_KEYS.PLAN_DONE_PREFIX, todayTR(), userId);

function mapRemotePlanTasks(dbTasks = [], generatedTasks = []) {
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

export function usePlanCompletion(userId) {
  // Ödül fonksiyonunu ref'te tutuyoruz: toggle'ın useCallback bağımlılığına
  // girmesin, her render'da yeniden oluşmasın.
  const { reward } = useGamification();
  const rewardRef = useRef(reward);
  rewardRef.current = reward;

  const [doneIds, setDoneIds] = useState(new Set());
  // Yan etkiler updater DIŞINDA çalışsın diye güncel değerin aynası.
  const doneIdsRef = useRef(doneIds);
  doneIdsRef.current = doneIds;
  const taskMapRef = useRef({});
  const syncedRef = useRef(false);

  useEffect(() => {
    setDoneIds(new Set());
    taskMapRef.current = {};
    syncedRef.current = false;
    getJson(getKey(userId), []).then((ids) => {
      if (Array.isArray(ids)) setDoneIds(new Set(ids));
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
        setDoneIds((prev) => {
          const merged = new Set([...prev, ...dbDoneIds]);
          setJson(getKey(userId), [...merged]);
          return merged;
        });
      }
    }).catch(() => {});
  }, [userId]);

  const syncPlan = useCallback(async (plan) => {
    if (!userId || userId === "dev") return;
    if (!plan?.tasks?.length) return;
    try {
      let dbPlan = await getDailyPlan(userId, todayTR());
      if (!dbPlan) {
        if (syncedRef.current) return;
        syncedRef.current = true;
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
      } else if (!dbPlan.plan_tasks?.length) {
        dbPlan = await createPlanTasks(
          dbPlan,
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
      syncedRef.current = true;
      if (dbPlan?.plan_tasks) {
        const { map, doneIds: dbDoneIds } = mapRemotePlanTasks(dbPlan.plan_tasks, plan.tasks);
        taskMapRef.current = map;
        if (dbDoneIds.length > 0) {
          setDoneIds((prev) => {
            const merged = new Set([...prev, ...dbDoneIds]);
            setJson(getKey(userId), [...merged]);
            return merged;
          });
        }
      }
    } catch {
      syncedRef.current = false;
    }
  }, [userId]);

  // XP ÖDÜLÜ BURADA — ekranda değil.
  //
  // Önceden yalnızca HomeScreen'deki `onTaskDone` callback'i ödül veriyordu,
  // yani aynı görevi Plan Detay ekranından işaretleyen kullanıcı HİÇ XP
  // almıyordu. "XP bozuk" izlenimi veren tipik bir tutarsızlık.
  // Ödülü hook'a taşımak tek kaynak sağlıyor: hangi ekrandan işaretlenirse
  // işaretlensin aynı davranış.
  const toggle = useCallback((id) => {
    // YAN ETKİLER UPDATER'IN DIŞINDA.
    //
    // Önceden diske yazma, sunucu çağrısı ve XP ödülü setDoneIds updater'ının
    // içindeydi. Updater SAF olmalı: React 18 eşzamanlı modda onu yeniden
    // çalıştırabilir, StrictMode ise iki kez çağırır — bu da çift XP ve çift
    // ağ isteği demek. useUserTasks.toggleTask bunu zaten doğru yapıyordu.
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
      // Başarısızsa KUYRUĞA girer. Eskiden togglePlanTask hatayı yutuyordu,
      // buradaki .catch de ölü koddu: tik cihazda duruyor ama sunucuda
      // completed sonsuza kadar false kalıyordu (yeni telefonda kayıp).
      savePlanTaskToggleOffline(dbId, nowDone).catch(() => {});
    }
    if (nowDone) rewardRef.current?.("plan_task_done");
  }, [userId]);

  const isDone = useCallback((id) => doneIds.has(id), [doneIds]);

  return { doneIds, isDone, toggle, syncPlan };
}
