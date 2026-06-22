import { supabase } from "./client";

const WQ_COLUMNS = "id, user_id, subject, topic, image_path, note, is_resolved, created_at, my_answer, correct_answer, next_review_at, interval_days, ease, last_reviewed_at, topic_source";

export const getWrongQuestions = async (userId, { subject, resolved } = {}) => {
  let query = supabase
    .from("wrong_questions")
    .select(WQ_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (subject) query = query.eq("subject", subject);
  if (resolved !== undefined) query = query.eq("is_resolved", resolved);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getWrongQuestionCount = async (userId) => {
  const { count, error } = await supabase
    .from("wrong_questions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return count ?? 0;
};

export const addWrongQuestion = async (question) => {
  const { data, error } = await supabase
    .from("wrong_questions")
    .insert(question)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const resolveWrongQuestion = async (id, userId) => {
  let query = supabase
    .from("wrong_questions")
    .update({ is_resolved: true })
    .eq("id", id);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
};

// G) SR: bugün tekrarı gelen yanlışlar (next_review_at <= now, çözülmemiş).
export const getDueWrongQuestions = async (userId) => {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("wrong_questions")
    .select(WQ_COLUMNS)
    .eq("user_id", userId)
    .eq("is_resolved", false)
    .not("next_review_at", "is", null)
    .lte("next_review_at", nowIso)
    .order("next_review_at", { ascending: true });
  if (error) throw error;
  return data || [];
};

// SR güncellemesi (tekrar sonrası interval/ease/next_review_at).
export const reviewWrongQuestion = async (id, userId, updates) => {
  let query = supabase
    .from("wrong_questions")
    .update(updates)
    .eq("id", id);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
};

export const deleteWrongQuestion = async (id, userId) => {
  let query = supabase
    .from("wrong_questions")
    .delete()
    .eq("id", id);
  if (userId) query = query.eq("user_id", userId);
  const { error } = await query;
  if (error) throw error;
};

export const uploadQuestionImage = async (userId, fileName, file) => {
  const path = `${userId}/${fileName}`;
  const { data, error } = await supabase.storage
    .from("wrong-questions")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  return data.path;
};

export const getQuestionImageUrl = async (path) => {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("wrong-questions")
    .createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
};
