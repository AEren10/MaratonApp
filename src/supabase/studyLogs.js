import { supabase } from "./client";

export const getStudyLogs = async (userId, { from, to } = {}) => {
  let query = supabase
    .from("study_logs")
    .select("*")
    .eq("user_id", userId)
    .order("study_date", { ascending: false });

  if (from) query = query.gte("study_date", from);
  if (to) query = query.lte("study_date", to);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getStudyLogsByDate = async (userId, date) => {
  const { data, error } = await supabase
    .from("study_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("study_date", date)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const addStudyLog = async (log) => {
  const { data, error } = await supabase
    .from("study_logs")
    .insert(log)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateStudyLog = async (id, updates) => {
  const { data, error } = await supabase
    .from("study_logs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteStudyLog = async (id) => {
  const { error } = await supabase.from("study_logs").delete().eq("id", id);
  if (error) throw error;
};
