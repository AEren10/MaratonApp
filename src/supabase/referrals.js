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

async function grantPremiumDays(userId, days) {
  const { error } = await supabase.rpc("grant_premium", {
    target_user_id: userId,
    days,
  });
  if (error) throw error;
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

export async function applyReferralCode(inviteeId, code) {
  const upper = code.trim().toUpperCase();

  // Try atomic RPC first
  try {
    const { data, error } = await supabase.rpc("apply_referral_code", {
      invitee_uuid: inviteeId,
      referral_code_input: upper,
    });
    if (!error && data) return data;
    if (error && !error.message?.includes("function") && !error.message?.includes("does not exist")) throw error;
  } catch (e) {
    if (e.message && !e.message.includes("function") && !e.message.includes("does not exist")) throw e;
  }

  // Fallback: client-side (for pre-migration deployments)
  const { data: inviter, error: inviterErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("referral_code", upper)
    .maybeSingle();
  if (inviterErr) throw inviterErr;
  if (!inviter) return { ok: false, reason: "invalid" };
  if (inviter.id === inviteeId) return { ok: false, reason: "self" };

  const { data: existing, error: existErr } = await supabase
    .from("referral_logs")
    .select("id")
    .eq("invitee_id", inviteeId)
    .maybeSingle();
  if (existErr) throw existErr;
  if (existing) return { ok: false, reason: "already_used" };

  const { error: insertErr } = await supabase.from("referral_logs").insert({
    inviter_id: inviter.id,
    invitee_id: inviteeId,
  });
  if (insertErr) throw insertErr;

  const { error: refErr } = await supabase
    .from("profiles")
    .update({ referred_by: inviter.id })
    .eq("id", inviteeId);
  if (refErr) handleSupabaseError(refErr, "applyReferralCode:referred_by");

  const grantErrors = [];
  try { await grantPremiumDays(inviteeId, 7); } catch (e) { grantErrors.push(e); handleSupabaseError(e, "applyReferralCode:inviteePremium"); }
  try { await grantPremiumDays(inviter.id, 7); } catch (e) { grantErrors.push(e); handleSupabaseError(e, "applyReferralCode:inviterPremium"); }

  if (grantErrors.length === 2) throw new Error("Premium verilemedi. Lütfen tekrar deneyin.");
  return { ok: true, inviterId: inviter.id };
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
