import { supabase } from "./client";

export async function listMyChallenges(userId) {
  const { data, error } = await supabase
    .from("challenges")
    .select("*, creator:profiles!challenges_creator_id_fkey(id, name, avatar_url), opponent:profiles!challenges_opponent_id_fkey(id, name, avatar_url)")
    .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createChallenge({ opponentId, metric, target, days = 7 }) {
  const today = new Date();
  const endsOn = new Date(today.getTime() + days * 86400000);
  const { data, error } = await supabase
    .from("challenges")
    .insert({
      opponent_id: opponentId,
      metric,
      target,
      starts_on: today.toISOString().split("T")[0],
      ends_on: endsOn.toISOString().split("T")[0],
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cancelChallenge(id) {
  const { error } = await supabase
    .from("challenges")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) throw error;
}

export async function bumpMyProgress(id, side, value) {
  // side is 'creator' or 'opponent'
  const field = side === "creator" ? "creator_progress" : "opponent_progress";
  const { data, error } = await supabase.rpc("noop").single().then(() => ({ data: null, error: null })).catch(() => ({ data: null, error: null }));
  // Simple non-atomic increment fallback
  const { data: existing, error: getErr } = await supabase
    .from("challenges")
    .select(field)
    .eq("id", id)
    .single();
  if (getErr) throw getErr;
  const next = (existing?.[field] || 0) + value;
  const { error: updErr } = await supabase
    .from("challenges")
    .update({ [field]: next })
    .eq("id", id);
  if (updErr) throw updErr;
  return next;
}
