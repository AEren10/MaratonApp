import { supabase } from "./client";

// React Native + Supabase storage için sağlam yöntem:
// fetch(uri).blob() bazen size=0 dönüyor → upload boş kalıyor.
// Çözüm: fetch().arrayBuffer() ile ham byte buffer'ı al ve upload et.
async function uriToArrayBuffer(uri) {
  const res = await fetch(uri);
  return await res.arrayBuffer();
}

function guessExt(uri) {
  const m = uri.match(/\.(jpg|jpeg|png|webp|heic|gif)(?:\?.*)?$/i);
  return (m?.[1] || "jpg").toLowerCase();
}

function mimeFor(ext) {
  const e = ext.toLowerCase();
  if (e === "jpg" || e === "jpeg") return "image/jpeg";
  if (e === "png") return "image/png";
  if (e === "webp") return "image/webp";
  if (e === "heic") return "image/heic";
  if (e === "gif") return "image/gif";
  return "image/jpeg";
}

export const uploadAvatar = async (userId, uri) => {
  const ext = guessExt(uri);
  const contentType = mimeFor(ext);
  const path = `${userId}/avatar.${ext}`;
  const buffer = await uriToArrayBuffer(uri);

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, { contentType, upsert: true });
  if (error) throw error;
  return data.path;
};

export const getAvatarUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
};

export const uploadWrongQuestionImage = async (userId, uri) => {
  const ext = guessExt(uri);
  const contentType = mimeFor(ext);
  const name = `${Date.now()}.${ext}`;
  const path = `${userId}/${name}`;
  const buffer = await uriToArrayBuffer(uri);

  const { data, error } = await supabase.storage
    .from("wrong-questions")
    .upload(path, buffer, { contentType, upsert: true });
  if (error) throw error;
  return data.path;
};

export const getWrongQuestionImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = supabase.storage.from("wrong-questions").getPublicUrl(path);
  return data.publicUrl;
};
