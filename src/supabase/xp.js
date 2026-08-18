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

const MAX_XP_ROWS = 5000;

function sumAmounts(rows) {
  if (!Array.isArray(rows)) return 0;
  return rows.reduce((acc, r) => acc + (Number(r?.amount) || 0), 0);
}

export async function getTotalXP(userId) {
  if (!userId || userId === "dev") return 0;
  try {
    const { data, error } = await supabase
      .from("xp_events")
      .select("amount")
      .eq("user_id", userId)
      .limit(MAX_XP_ROWS);
    if (error) throw error;
    return sumAmounts(data);
  } catch (e) {
    handleSupabaseError(e, "getTotalXP");
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
      .gte("created_at", monday.toISOString())
      .limit(MAX_XP_ROWS);
    if (error) throw error;
    return sumAmounts(data);
  } catch (e) {
    handleSupabaseError(e, "getWeeklyXP");
    return 0;
  }
}
