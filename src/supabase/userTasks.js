import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

export const getUserTasksByDate = async (userId, date) => {
  try {
    const { data, error } = await supabase
      .from("user_tasks")
      .select("id, user_id, task_date, subject, topic, question_count, note, completed, created_at")
      .eq("user_id", userId)
      .eq("task_date", date)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) {
    handleSupabaseError(e, "getUserTasksByDate");
    throw e;
  }
};

export const createUserTask = async (task) => {
  try {
    const { data, error } = await supabase
      .from("user_tasks")
      .insert(task)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "createUserTask");
    throw e;
  }
};

export const updateUserTask = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from("user_tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
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
