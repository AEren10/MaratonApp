import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";
import { invalidateMyProfileCache } from "./profiles";

// UUID 8-4-4-4-12. Eskiden bir 4'luk grup eksikti: HICBIR gercek kimlik gecmiyordu
// ("Profili gor" -> "Gecersiz profil", arkadas istegi reddediliyordu; 4 Ekim).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getPublicProfile(userId) {
  if (!UUID_RE.test(userId || "")) throw new Error("Geçersiz profil");
  const { data, error } = await supabase.rpc("get_public_profile", { p_user: userId });
  if (error) {
    handleSupabaseError(error, "getPublicProfile");
    throw new Error(error.code === "42501" ? "Bu profil görüntülenemiyor." : "Profil yüklenemedi.");
  }
  return {
    id: data.id,
    name: data.name,
    avatarUrl: data.avatar_url,
    examType: data.exam_type,
    currentStreak: Number(data.current_streak) || 0,
    weeklyQuestions: Number(data.weekly_questions) || 0,
    weeklyMinutes: Number(data.weekly_minutes) || 0,
    relationshipStatus: data.relationship_status || "none",
    subjectProgress: (data.subject_progress || []).map((item) => ({
      key: item.subject_key,
      name: item.subject_name,
      pct: Number(item.progress_percent) || 0,
    })),
  };
}

export async function updatePublicProfileVisibility(userId, visibility) {
  if (!UUID_RE.test(userId || "")) throw new Error("Geçersiz kullanıcı");
  if (!["group_and_friends", "friends_only"].includes(visibility)) {
    throw new Error("Geçersiz görünürlük tercihi");
  }
  const { error } = await supabase
    .from("profiles")
    .update({ public_profile_visibility: visibility })
    .eq("id", userId);
  if (error) {
    handleSupabaseError(error, "updatePublicProfileVisibility");
    throw error;
  }
  invalidateMyProfileCache();
}
