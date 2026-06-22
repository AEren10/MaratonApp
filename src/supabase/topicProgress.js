import { supabase } from "./client";

export const getTopicProgress = async (userId) => {
  const { data, error } = await supabase
    .from("topic_progress")
    .select("id, subject_key, topic_id, total_questions, correct_count, study_count, last_studied_at, topics(name)")
    .eq("user_id", userId)
    .order("last_studied_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => ({
    ...r,
    topic_name: r.topics?.name || null,
  }));
};

export const getSubjectProgress = async (userId, subjectKey) => {
  const { data, error } = await supabase
    .from("topic_progress")
    .select("id, subject_key, topic_id, total_questions, correct_count, study_count, last_studied_at")
    .eq("user_id", userId)
    .eq("subject_key", subjectKey)
    .order("last_studied_at", { ascending: false });
  if (error) throw error;
  return data;
};
