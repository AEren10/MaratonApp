import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

export async function logXP(userId, amount, action) {
  if (!userId || userId === "dev" || !amount) return;
  try {
    const { error } = await supabase.from("xp_events").insert({ user_id: userId, amount, action });
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "logXP");
    throw e;
  }
}

export async function getTotalXP(userId) {
  if (!userId || userId === "dev") return 0;
  try {
    const { data, error } = await supabase
      .from("xp_events")
      .select("amount.sum()")
      .eq("user_id", userId)
      .single();
    if (error) return 0;
    return data?.sum || 0;
  } catch {
    return 0;
  }
}

export async function getWeeklyXP(userId) {
  if (!userId || userId === "dev") return 0;
  try {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("xp_events")
      .select("amount.sum()")
      .eq("user_id", userId)
      .gte("created_at", monday.toISOString())
      .single();
    if (error) return 0;
    return data?.sum || 0;
  } catch {
    return 0;
  }
}
