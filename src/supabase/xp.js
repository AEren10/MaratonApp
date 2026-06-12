import { supabase } from "./client";

// XP olayını Supabase defterine yaz (lig gerçek XP'den hesaplanır).
// Fire-and-forget: hata UI'ı bloklamaz.
export async function logXP(userId, amount, action) {
  if (!userId || userId === "dev" || !amount) return;
  try {
    await supabase.from("xp_events").insert({ user_id: userId, amount, action });
  } catch (_) {}
}
