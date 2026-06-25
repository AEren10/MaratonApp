import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// F) Grup ligi modülü.

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// Client-side brute-force throttle for join codes
const JOIN_THROTTLE = {
  failures: 0,
  lockedUntil: 0,
  MAX_FAILURES: 5,
  LOCKOUT_MS: 5 * 60 * 1000, // 5 min lockout after MAX_FAILURES
  getBackoffMs() {
    if (this.failures === 0) return 0;
    // Exponential backoff: 1s, 2s, 4s, 8s then lockout
    return Math.min(1000 * Math.pow(2, this.failures - 1), this.LOCKOUT_MS);
  },
  check() {
    const now = Date.now();
    if (this.lockedUntil > now) {
      const secs = Math.ceil((this.lockedUntil - now) / 1000);
      throw new Error(`Cok fazla basarisiz deneme. ${secs} saniye sonra tekrar deneyin.`);
    }
    const backoff = this.getBackoffMs();
    if (backoff > 0 && this.lastAttempt && now - this.lastAttempt < backoff) {
      const secs = Math.ceil((backoff - (now - this.lastAttempt)) / 1000);
      throw new Error(`Lutfen ${secs} saniye bekleyin.`);
    }
  },
  recordFailure() {
    this.failures += 1;
    this.lastAttempt = Date.now();
    if (this.failures >= this.MAX_FAILURES) {
      this.lockedUntil = Date.now() + this.LOCKOUT_MS;
    }
  },
  recordSuccess() {
    this.failures = 0;
    this.lockedUntil = 0;
    this.lastAttempt = 0;
  },
};

export async function createGroup(name) {
  try {
    if (!name?.trim()) throw new Error("Grup adı gerekli");
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
    if (memberErr) {
      handleSupabaseError(memberErr, "createGroup:addOwner");
      await supabase.from("groups").delete().eq("id", data.id);
      throw memberErr;
    }
    return data;
  } catch (e) {
    handleSupabaseError(e, "createGroup");
    throw e;
  }
}

export async function joinByCode(code) {
  if (!code || typeof code !== "string") throw new Error("Geçersiz grup kodu");
  const trimmed = code.trim().toUpperCase();
  if (trimmed.length < 4) throw new Error("Grup kodu en az 4 karakter olmalı");
  JOIN_THROTTLE.check();
  try {
    const { data, error } = await supabase.rpc("join_group_by_code", { group_code: trimmed });
    if (error) throw error;
    JOIN_THROTTLE.recordSuccess();
    return data; // group id
  } catch (e) {
    JOIN_THROTTLE.recordFailure();
    handleSupabaseError(e, "joinByCode");
    throw e;
  }
}

export async function listMyGroups(userId) {
  try {
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id, groups(id, name, code, owner_id)")
      .eq("user_id", userId);
    if (error) throw error;
    return (data || []).map((r) => r.groups).filter(Boolean);
  } catch (e) {
    handleSupabaseError(e, "listMyGroups");
    throw e;
  }
}

export async function leaveGroup(groupId, userId) {
  if (!userId) throw new Error("userId is required");
  try {
    const { data: group } = await supabase
      .from("groups")
      .select("owner_id")
      .eq("id", groupId)
      .maybeSingle();
    if (group?.owner_id === userId) throw new Error("Grup sahibi gruptan ayrılamaz. Önce grubu silin.");
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "leaveGroup");
    throw e;
  }
}

// Grup içi haftalık leaderboard (mevcut leaderboard_weekly view + üyeler).
export async function groupLeaderboard(groupId, userId) {
  try {
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
  } catch (e) {
    handleSupabaseError(e, "groupLeaderboard");
    throw e;
  }
}
