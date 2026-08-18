import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}


export async function getOrCreateReferralCode(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;

  if (data?.referral_code) return data.referral_code;

  let code = generateCode();
  let attempts = 0;
  while (attempts < 5) {
    const { error: upErr } = await supabase
      .from("profiles")
      .update({ referral_code: code })
      .eq("id", userId);
    if (!upErr) return code;
    code = generateCode();
    attempts++;
  }
  throw new Error("Referral kodu oluşturulamadı");
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
