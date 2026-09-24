import { todayTR } from "../../lib/dateUtils";
import { getDailyPlan, createDailyPlan, createPlanTasks } from "../../supabase/plans";
import { STORAGE_KEYS, datedUserKey } from "../../constants/storageKeys";
import { setJson } from "../../lib/storage/appStorage";
import { mapRemotePlanTasks } from "./planTaskIdentity";

const getKey = (userId) => datedUserKey(STORAGE_KEYS.PLAN_DONE_PREFIX, todayTR(), userId);

export async function syncPlanRemote({ userId, plan, syncedRef, taskMapRef, setDoneIds, rewardedIdsRef }) {
  if (!userId || userId === "dev" || !plan?.tasks?.length) return;
  try {
    let dbPlan = await getDailyPlan(userId, todayTR());
    if (!dbPlan) {
      if (syncedRef?.current) return;
      if (syncedRef) syncedRef.current = true;
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
    } else if (!dbPlan.plan_tasks?.length && !syncedRef?.current) {
      // Bayrak AWAIT'ten ONCE kaldiriliyor: iki cagri ayni anda "gorev
      // yok" okuyup ikisi birden yazmaya gitmesin. 22 Eylul'de tam bu
      // oldu -- uc parti, hepsi 00:14:06 icinde. Veritabanindaki
      // plan_tasks_unique_per_plan indeksi son savunma, bu ilk savunma.
      if (syncedRef) syncedRef.current = true;
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
    if (syncedRef) syncedRef.current = true;
    if (dbPlan?.plan_tasks) {
      const { map, doneIds: dbDoneIds } = mapRemotePlanTasks(dbPlan.plan_tasks, plan.tasks);
      if (taskMapRef) taskMapRef.current = map;
      if (dbDoneIds.length > 0) {
        dbDoneIds.forEach((id) => rewardedIdsRef?.current?.add(id));
        setDoneIds((prev) => {
          const merged = new Set([...prev, ...dbDoneIds]);
          setJson(getKey(userId), [...merged]);
          return merged;
        });
      }
    }
  } catch {
    if (syncedRef) syncedRef.current = false;
  }
}
