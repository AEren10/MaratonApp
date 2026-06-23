import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

export async function logXP(userId, amount, action) {
  if (!userId || userId === "dev" || !amount) return;
  try {
    const { error } = await supabase.from("xp_events").insert({ user_id: userId, amount, action });
    handleSupabaseError(error, "logXP");
  } catch (e) {
    handleSupabaseError(e, "logXP");
  }
}

export async function getTotalXP(userId) {
  if (!userId || userId === "dev") return 0;
  try {
    const { data, error } = await supabase
      .from("xp_events")
      .select("amount")
      .eq("user_id", userId);
    if (error) return 0;
    return (data || []).reduce((sum, r) => sum + (r.amount || 0), 0);
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
      .select("amount")
      .eq("user_id", userId)
      .gte("created_at", monday.toISOString());
    if (error) return 0;
    return (data || []).reduce((sum, r) => sum + (r.amount || 0), 0);
  } catch {
    return 0;
  }
}
