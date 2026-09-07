import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";
import { normalizeUserTask, toUserTaskRow } from "../domain/tasks/userTaskModel";

const TASK_COLUMNS = "id, user_id, task_date, subject, topic, question_count, target_minutes, note, completed, created_at, updated_at, client_operation_id";

function isIdempotencyConflict(error) {
  return error?.code === "23505" && String(error?.message || "").includes("client_operation_id");
}

async function getUserTaskByClientOperationId(userId, clientOperationId) {
  if (!userId || !clientOperationId) return null;
  const { data, error } = await supabase
    .from("user_tasks")
    .select(TASK_COLUMNS)
    .eq("user_id", userId)
    .eq("client_operation_id", clientOperationId)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeUserTask(data) : null;
}

export const getUserTasksByDate = async (userId, date) => {
  try {
    const { data, error } = await supabase
      .from("user_tasks")
      .select(TASK_COLUMNS)
      .eq("user_id", userId)
      .eq("task_date", date)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map(normalizeUserTask);
  } catch (e) {
    handleSupabaseError(e, "getUserTasksByDate");
    throw e;
  }
};

export const getCalendarTasks = async (userId, subject = "__calendar") => {
  try {
    const { data, error } = await supabase
      .from("user_tasks")
      .select("id, task_date, note, completed")
      .eq("user_id", userId)
      .eq("subject", subject)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) {
    handleSupabaseError(e, "getCalendarTasks");
    throw e;
  }
};

export const createUserTask = async (task) => {
  try {
    const { data, error } = await supabase
      .from("user_tasks")
      .insert(toUserTaskRow(task))
      .select()
      .single();
    if (error) throw error;
    return normalizeUserTask(data);
  } catch (e) {
    if (isIdempotencyConflict(e)) {
      const existing = await getUserTaskByClientOperationId(task.user_id, task.client_operation_id);
      if (existing) return existing;
    }
    handleSupabaseError(e, "createUserTask");
    throw e;
  }
};

export const updateUserTask = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from("user_tasks")
      .update({ ...toUserTaskRow(updates), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? normalizeUserTask(data) : data;
  } catch (e) {
    handleSupabaseError(e, "updateUserTask");
    throw e;
  }
};

export const deleteUserTask = async (id, userId) => {
  if (!userId) throw new Error("userId is required");
  try {
    const { error } = await supabase.from("user_tasks").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "deleteUserTask");
    throw e;
  }
};

export const deleteUserTasksByDate = async (userId, date) => {
  if (!userId) throw new Error("userId is required");
  try {
    const { error } = await supabase
      .from("user_tasks")
      .delete()
      .eq("user_id", userId)
      .eq("task_date", date);
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "deleteUserTasksByDate");
    throw e;
  }
};
