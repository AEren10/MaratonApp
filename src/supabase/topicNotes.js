import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// Konu notu oku.
export async function getTopicNote(userId, subjectKey, topicName) {
  try {
    const { data, error } = await supabase
      .from("topic_notes")
      .select("content, updated_at")
      .eq("user_id", userId)
      .eq("subject_key", subjectKey)
      .eq("topic_name", topicName)
      .maybeSingle();
    if (error) throw error;
    return data?.content || "";
  } catch (e) {
    handleSupabaseError(e, "getTopicNote");
    throw e;
  }
}

// Konu notu kaydet (upsert).
export async function saveTopicNote(userId, subjectKey, topicName, content) {
  if (!userId) throw new Error("userId is required");
  try {
    const { error } = await supabase
      .from("topic_notes")
      .upsert(
        { user_id: userId, subject_key: subjectKey, topic_name: topicName, content, updated_at: new Date().toISOString() },
        { onConflict: "user_id,subject_key,topic_name" }
      );
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "saveTopicNote");
    throw e;
  }
}
