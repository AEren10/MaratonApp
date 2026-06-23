import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

export const getProfile = async (userId) => {
  if (!userId) throw new Error("userId is required");
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, exam_type, exam_date, field, target_ranking, target_department, daily_question_goal, weekly_trials_goal, weekly_minutes_goal, bio, target_program_id, show_in_leaderboard, badges, gamification_stats")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const saveGamificationToSupabase = async (userId, badges, stats) => {
  if (!userId || userId === "dev") return;
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ badges: badges || [], gamification_stats: stats || {} })
      .eq("id", userId);
    if (error) handleSupabaseError(error, "saveGamificationToSupabase");
  } catch (e) {
    handleSupabaseError(e, "saveGamificationToSupabase");
  }
};

export const registerPushToken = async (userId, token) => {
  if (!userId || userId === "dev" || !token) return;
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ expo_push_token: token })
      .eq("id", userId);
    if (error) handleSupabaseError(error, "registerPushToken");
  } catch (e) {
    handleSupabaseError(e, "registerPushToken");
  }
};

export const updateProfile = async (userId, updates) => {
  if (!userId) throw new Error("userId is required");
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getPremiumStatus = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_premium, premium_until")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return false;
    if (data.premium_until && new Date(data.premium_until) <= new Date()) return false;
    return !!data.is_premium;
  } catch (e) {
    handleSupabaseError(e, "getPremiumStatus");
    return null;
  }
};

export const updateExamConfig = async (userId, config) => {
  const examDate = config.examDate instanceof Date
    ? config.examDate.toISOString().split("T")[0]
    : config.examDate || null;
  return updateProfile(userId, {
    exam_type: config.examType,
    field: config.field || null,
    exam_date: examDate,
    target_ranking: config.targetRanking || null,
    target_department: config.targetDepartment || null,
  });
};
