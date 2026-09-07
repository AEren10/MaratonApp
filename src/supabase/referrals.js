import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";


export async function getOrCreateReferralCode(userId) {
  if (!userId || userId === "dev") return null;
  const { data, error } = await supabase.rpc("get_or_create_referral_code");
  if (error) throw error;
  if (!data) throw new Error("Referral kodu oluşturulamadı");
  return data;
}

// Tek yol: atomic RPC. Eski client-side fallback kaldirildi — premium artik
// client'tan yazilamiyor (migration 038), o yuzden fallback referans kaydini
// olusturup odulu veremiyordu ve kullanici hakkini bosa harciyordu.
export async function applyReferralCode(inviteeId, code) {
  const upper = code.trim().toUpperCase();
  try {
    const { data, error } = await supabase.rpc("apply_referral_code", {
      invitee_uuid: inviteeId,
      referral_code_input: upper,
    });
    if (error) throw error;
    return data ?? { ok: false, reason: "invalid" };
  } catch (e) {
    handleSupabaseError(e, "applyReferralCode");
    throw e;
  }
}

export async function getReferralStats(userId) {
  const { count, error } = await supabase
    .from("referral_logs")
    .select("id", { count: "exact", head: true })
    .eq("inviter_id", userId);
  if (error) {
    handleSupabaseError(error, "getReferralStats");
    return { referralCount: 0 };
  }
  return { referralCount: count || 0 };
}
