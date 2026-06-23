import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

function guessExt(uri) {
  const m = uri.match(/\.(jpg|jpeg|png|webp|heic|gif)(?:\?.*)?$/i);
  const raw = (m?.[1] || "jpg").toLowerCase();
  if (raw === "heic" || raw === "gif") return "jpg";
  return raw;
}

function mimeFor(ext) {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

async function uploadAnswerImage(userId, uri) {
  try {
    const ext = guessExt(uri);
    const path = `${userId}/${Date.now()}.${ext}`;
    const res = await fetch(uri);
    if (!res.ok) throw new Error("Görsel yüklenemedi");
    const buffer = await res.arrayBuffer();
    const { data, error } = await supabase.storage
      .from("community-answers")
      .upload(path, buffer, { contentType: mimeFor(ext), upsert: true });
    if (error) throw error;
    return data?.path ?? null;
  } catch (e) {
    handleSupabaseError(e, "uploadAnswerImage");
    throw e;
  }
}

export async function getSharedQuestions({ subject, limit = 20, offset = 0 } = {}) {
  try {
    let query = supabase
      .from("shared_questions")
      .select("*, profiles:shared_questions_user_id_profiles_fkey(name, avatar_url)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (subject) query = query.eq("subject", subject);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((q) => ({
      ...q,
      profile: q.is_anonymous ? null : q.profiles,
      profiles: undefined,
    }));
  } catch (e) {
    handleSupabaseError(e, "getSharedQuestions");
    throw e;
  }
}

export async function shareQuestion({
  wrongQuestionId,
  userId,
  subject,
  topic,
  imagePath,
  note,
  isAnonymous = true,
}) {
  try {
    const { data, error } = await supabase
      .from("shared_questions")
      .insert({
        wrong_question_id: wrongQuestionId,
        user_id: userId,
        subject,
        topic,
        image_path: imagePath,
        note,
        is_anonymous: isAnonymous,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "shareQuestion");
    throw e;
  }
}

export async function unshareQuestion(id, userId) {
  if (!userId) throw new Error("userId is required");
  try {
    const { error } = await supabase
      .from("shared_questions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "unshareQuestion");
    throw e;
  }
}

export async function getAnswers(sharedQuestionId) {
  try {
    const { data, error } = await supabase
      .from("question_answers")
      .select("*, profiles:question_answers_user_id_profiles_fkey(name, avatar_url)")
      .eq("shared_question_id", sharedQuestionId)
      .order("created_at", { ascending: true });
    if (error) throw error;

    return (data || []).map((a) => ({
      ...a,
      profile: a.is_anonymous ? null : a.profiles,
      profiles: undefined,
    }));
  } catch (e) {
    handleSupabaseError(e, "getAnswers");
    throw e;
  }
}

export async function postAnswer({
  sharedQuestionId,
  userId,
  text,
  imageUri,
  isAnonymous = true,
}) {
  try {
    let imagePath = null;
    if (imageUri) {
      try {
        imagePath = await uploadAnswerImage(userId, imageUri);
      } catch (e) {
        handleSupabaseError(e, "postAnswer:image");
      }
    }

    const { data, error } = await supabase
      .from("question_answers")
      .insert({
        shared_question_id: sharedQuestionId,
        user_id: userId,
        text: text || null,
        image_path: imagePath,
        is_anonymous: isAnonymous,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "postAnswer");
    throw e;
  }
}

export function subscribeToAnswers(sharedQuestionId, callback) {
  const channel = supabase
    .channel(`answers:${sharedQuestionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "question_answers",
        filter: `shared_question_id=eq.${sharedQuestionId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToFeed(callback) {
  const channel = supabase
    .channel("community-feed")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "shared_questions",
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function isQuestionShared(wrongQuestionId) {
  try {
    const { count, error } = await supabase
      .from("shared_questions")
      .select("id", { count: "exact", head: true })
      .eq("wrong_question_id", wrongQuestionId);
    if (error) throw error;
    return count > 0;
  } catch (e) {
    handleSupabaseError(e, "isQuestionShared");
    throw e;
  }
}

export async function getSharedQuestionIds(wrongQuestionIds) {
  try {
    if (!wrongQuestionIds.length) return new Set();
    const { data, error } = await supabase
      .from("shared_questions")
      .select("wrong_question_id")
      .in("wrong_question_id", wrongQuestionIds);
    if (error) throw error;
    return new Set((data || []).map((r) => r.wrong_question_id));
  } catch (e) {
    handleSupabaseError(e, "getSharedQuestionIds");
    throw e;
  }
}
