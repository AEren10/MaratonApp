import { supabase } from "./client";

export const uploadAvatar = async (userId, uri) => {
  const ext = uri.split(".").pop() || "jpg";
  const path = `${userId}/avatar.${ext}`;
  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(path, blob, { contentType: `image/${ext}`, upsert: true });
  if (error) throw error;
  return data.path;
};

export const getAvatarUrl = (path) => {
  if (!path) return null;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
};

export const uploadWrongQuestionImage = async (userId, uri) => {
  const ext = uri.split(".").pop() || "jpg";
  const name = `${Date.now()}.${ext}`;
  const path = `${userId}/${name}`;
  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from("wrong-questions")
    .upload(path, blob, { contentType: `image/${ext}`, upsert: true });
  if (error) throw error;
  return data.path;
};

export const getWrongQuestionImageUrl = (path) => {
  if (!path) return null;
  const { data } = supabase.storage.from("wrong-questions").getPublicUrl(path);
  return data.publicUrl;
};
