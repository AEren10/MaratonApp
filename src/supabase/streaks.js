import { supabase } from "./client";

export const getStreak = async (userId) => {
  const { data, error } = await supabase
    .from("streaks")
    .select("*")
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
};

export const updateStreak = async (userId, updates) => {
  const { data, error } = await supabase
    .from("streaks")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};
