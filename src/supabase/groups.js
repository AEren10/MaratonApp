import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// F) Grup ligi modülü.

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createGroup(name) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum yok");
  const code = genCode();
  const { data, error } = await supabase
    .from("groups")
    .insert({ name: name.trim(), code, owner_id: user.id })
    .select()
    .single();
  if (error) throw error;
  // Sahip otomatik üye olur.
  const { error: memberErr } = await supabase.from("group_members").insert({ group_id: data.id, user_id: user.id });
  handleSupabaseError(memberErr, "createGroup:addOwner");
  return data;
}

export async function joinByCode(code) {
  const { data, error } = await supabase.rpc("join_group_by_code", { group_code: code.trim().toUpperCase() });
  if (error) throw error;
  return data; // group id
}

export async function listMyGroups(userId) {
  const { data, error } = await supabase
    .from("group_members")
    .select("group_id, groups(id, name, code, owner_id)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((r) => r.groups).filter(Boolean);
}

export async function leaveGroup(groupId, userId) {
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);
  if (error) throw error;
}

// Grup içi haftalık leaderboard (mevcut leaderboard_weekly view + üyeler).
export async function groupLeaderboard(groupId, userId) {
  const { data: members, error: mErr } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId);
  if (mErr) throw mErr;
  const ids = (members || []).map((m) => m.user_id);
  if (!ids.length) return { list: [], myRank: null, myScore: 0 };

  const { data, error } = await supabase
    .from("leaderboard_weekly")
    .select("user_id, name, avatar_url, weekly_xp, questions, trials")
    .in("user_id", ids)
    .order("weekly_xp", { ascending: false });
  if (error) throw error;

  const list = (data || []).map((r, i) => ({
    ...r,
    weekly_xp: r.weekly_xp || 0,
    rank: i + 1,
    you: r.user_id === userId,
  }));
  const mine = list.find((r) => r.you);
  return { list, myRank: mine?.rank ?? null, myScore: mine?.weekly_xp ?? 0 };
}
