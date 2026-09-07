import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";
import { dateKey, todayTR } from "../lib/dateUtils";

export const getProfile = async (userId) => {
  if (!userId) throw new Error("userId is required");
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, exam_type, exam_date, field, target_ranking, target_department, daily_question_goal, weekly_trials_goal, weekly_minutes_goal, bio, target_program_id, show_in_leaderboard, gamification_stats, study_session_count, login_rewarded_date, review_last_asked, last_active, premium_until, trial_started_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const saveGamificationToSupabase = async (userId, stats, claimedMilestones) => {
  if (!userId || userId === "dev") return;
  const payload = { ...(stats || {}), claimedMilestones: claimedMilestones || [] };
  const { error } = await supabase
    .from("profiles")
    .update({ gamification_stats: payload })
    .eq("id", userId);
  if (error) {
    handleSupabaseError(error, "saveGamificationToSupabase");
    throw error;
  }
};

// Streak ödülü: gün sayısını ve hak edilip edilmediğini sunucu doğrular.
// Client sadece hangi milestone'u talep ettiğini söyler.
export const claimStreakMilestoneReward = async (milestoneDay) => {
  if (!Number.isInteger(milestoneDay)) return null;
  try {
    const { data, error } = await supabase.rpc("claim_streak_milestone", {
      milestone_day: milestoneDay,
    });
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "claimStreakMilestoneReward");
    return null;
  }
};

// DEPRECATED: grant_premium artık sadece service_role'a açık (migration 038).
// Yalnızca RevenueCat webhook'u gibi sunucu tarafı çağırmalı.
export const grantPremiumDays = async (userId, days) => {
  if (!userId || userId === "dev" || !days) return;
  try {
    const { error } = await supabase.rpc("grant_premium", {
      target_user_id: userId,
      days,
    });
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "grantPremiumDays");
  }
};

export const startTrial = async (userId) => {
  if (!userId || userId === "dev") return false;
  try {
    const { data, error } = await supabase.rpc("start_trial");
    if (error) throw error;
    return !!data;
  } catch (e) {
    handleSupabaseError(e, "startTrial");
    return false;
  }
};

export const getTrialInfo = async (userId) => {
  if (!userId || userId === "dev") return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("trial_started_at, premium_until")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const now = new Date();
    const trialActive = data.trial_started_at &&
      (now - new Date(data.trial_started_at)) < 7 * 86400000;
    const premiumActive = data.premium_until &&
      new Date(data.premium_until) > now;
    return {
      trialStartedAt: data.trial_started_at,
      isInTrial: !!trialActive,
      isPremium: !!premiumActive,
      trialDaysLeft: trialActive
        ? Math.max(0, Math.ceil((7 * 86400000 - (now - new Date(data.trial_started_at))) / 86400000))
        : 0,
    };
  } catch (e) {
    handleSupabaseError(e, "getTrialInfo");
    return null;
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

export const updateLastActive = async (userId, at = new Date().toISOString()) => {
  if (!userId || userId === "dev") return;
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ last_active: at })
      .eq("id", userId);
    if (error) handleSupabaseError(error, "updateLastActive");
  } catch (e) {
    handleSupabaseError(e, "updateLastActive");
  }
};

export const updateNotificationPrefs = async (userId, prefs) => {
  if (!userId || userId === "dev") return;
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ notification_prefs: prefs })
      .eq("id", userId);
    if (error) handleSupabaseError(error, "updateNotificationPrefs");
  } catch (e) {
    handleSupabaseError(e, "updateNotificationPrefs");
  }
};

export const getNotificationPrefs = async (userId) => {
  if (!userId || userId === "dev") return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("notification_prefs")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data?.notification_prefs || null;
  } catch (e) {
    handleSupabaseError(e, "getNotificationPrefs");
    return null;
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
      .select("premium_until")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data?.premium_until) return false;
    return new Date(data.premium_until) > new Date();
  } catch (e) {
    handleSupabaseError(e, "getPremiumStatus");
    return null;
  }
};

export const incrementSessionCount = async (userId) => {
  if (!userId || userId === "dev") return;
  try {
    const { data, error } = await supabase.rpc("increment_study_session");
    if (error) throw error;
    const count = Number(data);
    return Number.isFinite(count) ? count : null;
  } catch (e) {
    handleSupabaseError(e, "incrementSessionCount");
    return null;
  }
};

export const markLoginRewarded = async (userId) => {
  if (!userId || userId === "dev") return;
  try {
    const today = todayTR();
    await supabase
      .from("profiles")
      .update({ login_rewarded_date: today })
      .eq("id", userId);
  } catch (e) {
    handleSupabaseError(e, "markLoginRewarded");
  }
};

export const markReviewAsked = async (userId) => {
  if (!userId || userId === "dev") return;
  try {
    await supabase
      .from("profiles")
      .update({ review_last_asked: new Date().toISOString() })
      .eq("id", userId);
  } catch (e) {
    handleSupabaseError(e, "markReviewAsked");
  }
};

export const getRetentionData = async (userId) => {
  if (!userId || userId === "dev") return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("study_session_count, login_rewarded_date, review_last_asked, last_active")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "getRetentionData");
    return null;
  }
};

export const updateExamConfig = async (userId, config) => {
  const examDate = config.examDate instanceof Date
    ? dateKey(config.examDate)
    : config.examDate || null;
  return updateProfile(userId, {
    exam_type: config.examType,
    field: config.field || null,
    exam_date: examDate,
    target_ranking: config.targetRanking || null,
    target_department: config.targetDepartment || null,
  });
};
