import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

export const getTopicProgress = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("topic_progress")
      .select("id, subject_key, topic_id, custom_topic, total_questions, correct_count, study_count, last_studied_at, topics(name)")
      .eq("user_id", userId)
      .order("last_studied_at", { ascending: false });
    if (error) throw error;
    // Serbest yazılan konularda topic_id yok, ad custom_topic'te tutuluyor.
    return (data || []).map((r) => ({
      ...r,
      topic_name: r.topics?.name || r.custom_topic || null,
    }));
  } catch (e) {
    handleSupabaseError(e, "getTopicProgress");
    throw e;
  }
};

export const getSubjectProgress = async (userId, subjectKey) => {
  try {
    const { data, error } = await supabase
      .from("topic_progress")
      .select("id, subject_key, topic_id, custom_topic, total_questions, correct_count, study_count, last_studied_at")
      .eq("user_id", userId)
      .eq("subject_key", subjectKey)
      .order("last_studied_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    handleSupabaseError(e, "getSubjectProgress");
    throw e;
  }
};
