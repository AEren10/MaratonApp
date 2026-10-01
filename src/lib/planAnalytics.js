import { EVENTS } from "../constants/analytics";
import { STORAGE_KEYS, datedUserKey } from "../constants/storageKeys";
import { todayTR } from "./dateUtils";
import { track } from "./analytics";
import { getString, setString } from "./storage/appStorage";

const completedDays = new Set();

export function planTaskSource(task) {
  if (task?.userTask || task?.source === "user") return "user";
  if (task?.routeStop) return "route";
  if (task?.adHoc) return "ad_hoc";
  if (task?.source === "ai") return "suggested";
  return "generated";
}

export function trackPlanTaskCompleted(task, surface) {
  track(EVENTS.PLAN_TASK_COMPLETED, {
    source: planTaskSource(task),
    surface,
    subject: task?.subject || task?.planSubjectKey || task?.s?.key || null,
    hasQuestions: Number(task?.count ?? task?.q ?? task?.questionCount) > 0,
  });
}

export async function trackPlanAllCompletedOnce(userId, tasks, surface) {
  if (!userId || !tasks?.length || !tasks.every((task) => task.completed ?? task.done)) return false;
  const key = datedUserKey(
    STORAGE_KEYS.PLAN_ANALYTICS_ALL_COMPLETED_PREFIX,
    todayTR(),
    userId,
  );
  if (completedDays.has(key)) return false;
  if (await getString(key)) return false;
  completedDays.add(key);
  await setString(key, "1");
  track(EVENTS.PLAN_ALL_COMPLETED, {
    surface,
    taskCount: tasks.length,
  });
  return true;
}
