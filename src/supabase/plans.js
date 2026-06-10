import { supabase } from "./client";

export const getDailyPlan = async (userId, date) => {
  const { data, error } = await supabase
    .from("daily_plans")
    .select("*, plan_tasks(*)")
    .eq("user_id", userId)
    .eq("plan_date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const createDailyPlan = async (plan, tasks) => {
  const { data: planData, error: planError } = await supabase
    .from("daily_plans")
    .insert(plan)
    .select()
    .single();
  if (planError) throw planError;

  const tasksWithPlanId = tasks.map((t) => ({
    ...t,
    plan_id: planData.id,
  }));

  const { error: taskError } = await supabase
    .from("plan_tasks")
    .insert(tasksWithPlanId);
  if (taskError) throw taskError;

  return getDailyPlan(plan.user_id, plan.plan_date);
};

export const completeTask = async (taskId) => {
  const { data, error } = await supabase
    .from("plan_tasks")
    .update({ completed: true })
    .eq("id", taskId)
    .select()
    .single();
  if (error) throw error;
  return data;
};
