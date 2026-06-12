import { supabase } from "./client";

// Konu notu oku.
export async function getTopicNote(userId, subjectKey, topicName) {
  const { data, error } = await supabase
    .from("topic_notes")
    .select("content, updated_at")
    .eq("user_id", userId)
    .eq("subject_key", subjectKey)
    .eq("topic_name", topicName)
    .maybeSingle();
  if (error) throw error;
  return data?.content || "";
}

// Konu notu kaydet (upsert).
export async function saveTopicNote(userId, subjectKey, topicName, content) {
  const { error } = await supabase
    .from("topic_notes")
    .upsert(
      { user_id: userId, subject_key: subjectKey, topic_name: topicName, content, updated_at: new Date().toISOString() },
      { onConflict: "user_id,subject_key,topic_name" }
    );
  if (error) throw error;
}
