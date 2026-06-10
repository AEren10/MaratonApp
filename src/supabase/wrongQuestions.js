import { supabase } from "./client";

export const getWrongQuestions = async (userId, { subject, resolved } = {}) => {
  let query = supabase
    .from("wrong_questions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (subject) query = query.eq("subject", subject);
  if (resolved !== undefined) query = query.eq("is_resolved", resolved);

  const { data, error } = await query;
  if (error) throw error;
  return data;
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

export const resolveWrongQuestion = async (id) => {
  const { data, error } = await supabase
    .from("wrong_questions")
    .update({ is_resolved: true })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteWrongQuestion = async (id) => {
  const { error } = await supabase
    .from("wrong_questions")
    .delete()
    .eq("id", id);
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

export const getQuestionImageUrl = (path) => {
  const { data } = supabase.storage
    .from("wrong-questions")
    .getPublicUrl(path);
  return data.publicUrl;
};
