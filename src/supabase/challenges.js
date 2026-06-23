import { supabase } from "./client";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function listMyChallenges(userId) {
  if (!userId || !UUID_RE.test(userId)) throw new Error("Invalid userId");
  const { data, error } = await supabase
    .from("challenges")
    .select("*, creator:profiles!challenges_creator_id_fkey(id, name, avatar_url), opponent:profiles!challenges_opponent_id_fkey(id, name, avatar_url)")
    .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getActiveChallengeCount(userId) {
  if (!userId || !UUID_RE.test(userId)) throw new Error("Invalid userId");
  const { count, error } = await supabase
    .from("challenges")
    .select("id", { count: "exact", head: true })
    .eq("creator_id", userId)
    .eq("status", "active");
  if (error) throw error;
  return count ?? 0;
}

const VALID_METRICS = ["questions", "minutes", "streak"];

export async function createChallenge({ opponentId, metric, target, days = 7 }) {
  if (!opponentId || !UUID_RE.test(opponentId)) throw new Error("Invalid opponentId");
  if (!VALID_METRICS.includes(metric)) throw new Error("Invalid metric");
  if (!Number.isFinite(target) || target <= 0) throw new Error("Invalid target");
  if (!Number.isFinite(days) || days < 1 || days > 30) throw new Error("Invalid days");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum yok");
  const today = new Date();
  const endsOn = new Date(today.getTime() + days * 86400000);
  const { data, error } = await supabase
    .from("challenges")
    .insert({
      creator_id: user.id,
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

export async function cancelChallenge(id, userId) {
  if (!id || !UUID_RE.test(id)) throw new Error("Invalid challenge id");
  let query = supabase
    .from("challenges")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (userId) query = query.eq("creator_id", userId);
  const { error } = await query;
  if (error) throw error;
}

export async function bumpMyProgress(id, side, value) {
  if (!id || !UUID_RE.test(id)) throw new Error("Invalid challenge id");
  if (side !== "creator" && side !== "opponent") throw new Error("Invalid side");
  if (!Number.isFinite(value) || value <= 0) throw new Error("Invalid value");
  const { data, error } = await supabase.rpc("bump_challenge_progress", {
    challenge_id: id,
    side,
    increment_value: value,
  });
  if (error) throw error;
  return data;
}
