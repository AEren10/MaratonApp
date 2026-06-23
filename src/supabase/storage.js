import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// React Native + Supabase storage için sağlam yöntem:
// fetch(uri).blob() bazen size=0 dönüyor → upload boş kalıyor.
// Çözüm: fetch().arrayBuffer() ile ham byte buffer'ı al ve upload et.
async function uriToArrayBuffer(uri) {
  try {
    const res = await fetch(uri);
    return await res.arrayBuffer();
  } catch (e) {
    handleSupabaseError(e, "uriToArrayBuffer");
    throw e;
  }
}

function guessExt(uri) {
  const m = uri.match(/\.(jpg|jpeg|png|webp|heic|gif)(?:\?.*)?$/i);
  const raw = (m?.[1] || "jpg").toLowerCase();
  if (raw === "heic" || raw === "gif") return "jpg";
  return raw;
}

function mimeFor(ext) {
  const e = ext.toLowerCase();
  if (e === "png") return "image/png";
  if (e === "webp") return "image/webp";
  return "image/jpeg";
}

export const uploadAvatar = async (userId, uri) => {
  if (!userId) throw new Error("userId is required");
  try {
    const ext = guessExt(uri);
    const contentType = mimeFor(ext);
    const path = `${userId}/avatar.${ext}`;
    const buffer = await uriToArrayBuffer(uri);

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(path, buffer, { contentType, upsert: true });
    if (error) throw error;
    return data?.path ?? null;
  } catch (e) {
    handleSupabaseError(e, "uploadAvatar");
    throw e;
  }
};

export const getAvatarUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
};

export const uploadWrongQuestionImage = async (userId, uri) => {
  if (!userId) throw new Error("userId is required");
  try {
    const ext = guessExt(uri);
    const contentType = mimeFor(ext);
    const name = `${Date.now()}.${ext}`;
    const path = `${userId}/${name}`;
    const buffer = await uriToArrayBuffer(uri);

    const { data, error } = await supabase.storage
      .from("wrong-questions")
      .upload(path, buffer, { contentType, upsert: true });
    if (error) throw error;
    return data?.path ?? null;
  } catch (e) {
    handleSupabaseError(e, "uploadWrongQuestionImage");
    throw e;
  }
};

export const getWrongQuestionImageUrl = async (path) => {
  try {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const { data, error } = await supabase.storage
      .from("wrong-questions")
      .createSignedUrl(path, 3600);
    if (handleSupabaseError(error, "getWrongQuestionImageUrl")) return null;
    return data?.signedUrl ?? null;
  } catch (e) {
    handleSupabaseError(e, "getWrongQuestionImageUrl");
    throw e;
  }
};
