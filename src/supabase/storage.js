import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// React Native + Supabase storage için sağlam yöntem:
// fetch(uri).blob() bazen size=0 dönüyor → upload boş kalıyor.
// Çözüm: fetch().arrayBuffer() ile ham byte buffer'ı al ve upload et.
// Bucket'ların canlıdaki sınırı 5 MB (avatars ve wrong-questions).
// Aşan dosya sunucudan anlaşılmaz bir hatayla dönüyor ve kullanıcı neden
// yükleyemediğini bilmiyordu. Yüklemeden ÖNCE kontrol edip anlamlı mesaj
// vermek, boşuna veri harcamayı da önlüyor.
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export class FileTooLargeError extends Error {
  constructor(bytes) {
    const mb = (bytes / 1024 / 1024).toFixed(1);
    super(`Fotoğraf çok büyük (${mb} MB). En fazla 5 MB olabilir.`);
    this.name = "FileTooLargeError";
    this.bytes = bytes;
    this._safeMessage = this.message;
  }
}

async function uriToArrayBuffer(uri) {
  try {
    const res = await fetch(uri);
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      throw new FileTooLargeError(buffer.byteLength);
    }
    return buffer;
  } catch (e) {
    if (e instanceof FileTooLargeError) throw e;
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
    // Uzantı SABİT: yol `${userId}/avatar.${ext}` olduğu için PNG'den sonra
    // JPG yüklenince eski dosya silinmiyor, kullanıcı başına birden fazla
    // artık dosya kalıyordu. Tek uzantıda upsert her seferinde üzerine yazar.
    const ext = guessExt(uri);
    const contentType = mimeFor(ext);
    const path = `${userId}/avatar.${ext}`;
    // Diğer uzantılardaki eski avatarları temizle.
    const stale = ["jpg", "png", "webp"].filter((x) => x !== ext).map((x) => `${userId}/avatar.${x}`);
    supabase.storage.from("avatars").remove(stale).catch(() => {});
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

// Hesap silmeden önce kullanıcının dosyalarını temizle.
// Supabase artık storage.objects üzerinde doğrudan SQL DELETE'e izin vermiyor —
// bu yüzden temizlik Storage API üzerinden, istemciden yapılmak zorunda.
export const deleteUserStorage = async (userId) => {
  if (!userId) return;
  for (const bucket of ["avatars", "wrong-questions"]) {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(userId);
      if (error) throw error;
      const paths = (data || [])
        .filter((f) => f?.name)
        .map((f) => `${userId}/${f.name}`);
      if (paths.length) {
        const { error: rmErr } = await supabase.storage.from(bucket).remove(paths);
        if (rmErr) throw rmErr;
      }
    } catch (e) {
      // Dosya temizliği başarısız olsa da hesap silme devam etmeli.
      handleSupabaseError(e, `deleteUserStorage:${bucket}`);
    }
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

export const createStorageSignedUrl = async (bucket, path, expiresIn = 3600) => {
  if (!bucket || !path) return null;
  if (path.startsWith("http")) return path;
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data?.signedUrl ?? null;
  } catch (e) {
    handleSupabaseError(e, "createStorageSignedUrl");
    return null;
  }
};
