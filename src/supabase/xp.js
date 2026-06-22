import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// XP olayını Supabase defterine yaz (lig gerçek XP'den hesaplanır).
// Fire-and-forget: hata UI'ı bloklamaz.
export async function logXP(userId, amount, action) {
  if (!userId || userId === "dev" || !amount) return;
  try {
    const { error } = await supabase.from("xp_events").insert({ user_id: userId, amount, action });
    handleSupabaseError(error, "logXP");
  } catch (e) {
    handleSupabaseError(e, "logXP");
  }
}
