import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

export const getStreak = async (userId) => {
  if (!userId) throw new Error("userId is required");
  try {
    const { data, error } = await supabase
      .from("streaks")
      .select("user_id, current_streak, longest_streak, last_study_date, freeze_count, last_freeze_at, freeze_reset_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      // Auto-create if missing (in case trigger didn't run)
      const { data: created, error: createErr } = await supabase
        .from("streaks")
        .insert({ user_id: userId, current_streak: 0, longest_streak: 0 })
        .select()
        .single();
      if (createErr) throw createErr;
      return created;
    }
    return data;
  } catch (e) {
    handleSupabaseError(e, "getStreak");
    throw e;
  }
};

export const updateStreak = async (userId, updates) => {
  if (!userId) throw new Error("userId is required");
  try {
    const { data, error } = await supabase
      .from("streaks")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "updateStreak");
    throw e;
  }
};
