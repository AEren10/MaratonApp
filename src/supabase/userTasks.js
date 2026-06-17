import { supabase } from "./client";

export const getUserTasksByDate = async (userId, date) => {
  const { data, error } = await supabase
    .from("user_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("task_date", date)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
};

export const createUserTask = async (task) => {
  const { data, error } = await supabase
    .from("user_tasks")
    .insert(task)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateUserTask = async (id, updates) => {
  const { data, error } = await supabase
    .from("user_tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteUserTask = async (id) => {
  const { error } = await supabase.from("user_tasks").delete().eq("id", id);
  if (error) throw error;
};

export const deleteUserTasksByDate = async (userId, date) => {
  const { error } = await supabase
    .from("user_tasks")
    .delete()
    .eq("user_id", userId)
    .eq("task_date", date);
  if (error) throw error;
};
