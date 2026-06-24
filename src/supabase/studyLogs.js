import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

const SL_COLUMNS = "id, user_id, subject, topic, question_count, correct_count, duration_minutes, study_date, created_at";

export const getStudyLogs = async (userId, { from, to } = {}) => {
  try {
    let query = supabase
      .from("study_logs")
      .select(SL_COLUMNS)
      .eq("user_id", userId)
      .order("study_date", { ascending: false });

    if (from) query = query.gte("study_date", from);
    if (to) query = query.lte("study_date", to);
    if (!from && !to) query = query.limit(500);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (e) {
    handleSupabaseError(e, "getStudyLogs");
    throw e;
  }
};

export const getStudyLogsByDate = async (userId, date) => {
  try {
    const { data, error } = await supabase
      .from("study_logs")
      .select(SL_COLUMNS)
      .eq("user_id", userId)
      .eq("study_date", date)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    handleSupabaseError(e, "getStudyLogsByDate");
    throw e;
  }
};

export const addStudyLog = async (log) => {
  try {
    const { data, error } = await supabase
      .from("study_logs")
      .insert(log)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "addStudyLog");
    throw e;
  }
};

export const updateStudyLog = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from("study_logs")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "updateStudyLog");
    throw e;
  }
};

export const deleteStudyLog = async (id, userId) => {
  if (!userId) throw new Error("userId is required");
  try {
    const { error } = await supabase.from("study_logs").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "deleteStudyLog");
    throw e;
  }
};

export const getStudyLogsByTopic = async (userId, subjectKey, topicName, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from("study_logs")
      .select("id, study_date, duration_minutes, question_count, correct_count, created_at")
      .eq("user_id", userId)
      .eq("subject", subjectKey)
      .eq("topic", topicName)
      .order("study_date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (e) {
    handleSupabaseError(e, "getStudyLogsByTopic");
    throw e;
  }
};
