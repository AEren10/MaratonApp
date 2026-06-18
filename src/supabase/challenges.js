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

export async function cancelChallenge(id) {
  const { error } = await supabase
    .from("challenges")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) throw error;
}

export async function bumpMyProgress(id, side, value) {
  const { data, error } = await supabase.rpc("bump_challenge_progress", {
    challenge_id: id,
    side,
    increment_value: value,
  });
  if (error) throw error;
  return data;
}
