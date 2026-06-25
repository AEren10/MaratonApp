import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

export const getDailyPlan = async (userId, date) => {
  try {
    const { data, error } = await supabase
      .from("daily_plans")
      .select("*, plan_tasks(*)")
      .eq("user_id", userId)
      .eq("plan_date", date)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "getDailyPlan");
    throw e;
  }
};

export const createDailyPlan = async (plan, tasks) => {
  try {
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
    if (taskError) {
      await supabase.from("daily_plans").delete().eq("id", planData.id);
      throw taskError;
    }

    return getDailyPlan(plan.user_id, plan.plan_date);
  } catch (e) {
    handleSupabaseError(e, "createDailyPlan");
    throw e;
  }
};

export const completeTask = async (taskId) => {
  try {
    const { data, error } = await supabase
      .from("plan_tasks")
      .update({ completed: true })
      .eq("id", taskId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "completeTask");
    throw e;
  }
};

export const togglePlanTask = async (taskId, completed) => {
  try {
    const { error } = await supabase
      .from("plan_tasks")
      .update({ completed })
      .eq("id", taskId);
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "togglePlanTask");
  }
};
