import { supabase } from "./client";

export const getStreak = async (userId) => {
  const { data, error } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
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
