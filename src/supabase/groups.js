import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";
import { normalizeGroupCode, rankGroupMembers, groupWeeklyGoalSummary } from "../domain/groups";

const JOIN_THROTTLE = {
  failures: 0,
  lockedUntil: 0,
  lastAttempt: 0,
  MAX_FAILURES: 5,
  LOCKOUT_MS: 5 * 60 * 1000,
  getBackoffMs() {
    if (this.failures === 0) return 0;
    return Math.min(1000 * 2 ** (this.failures - 1), this.LOCKOUT_MS);
  },
  check() {
    const now = Date.now();
    if (this.lockedUntil > now) {
      const secs = Math.ceil((this.lockedUntil - now) / 1000);
      throw new Error(`Çok fazla başarısız deneme. ${secs} saniye sonra tekrar deneyin.`);
    }
    const backoff = this.getBackoffMs();
    if (backoff > 0 && this.lastAttempt && now - this.lastAttempt < backoff) {
      const secs = Math.ceil((backoff - (now - this.lastAttempt)) / 1000);
      throw new Error(`Lütfen ${secs} saniye bekleyin.`);
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

function ensureOk(result, fallback = "İşlem tamamlanamadı") {
  if (result?.ok === false) {
    const err = new Error(reasonMessage(result.reason) || fallback);
    err.reason = result.reason;
    throw err;
  }
  return result;
}

function reasonMessage(reason) {
  return {
    unauthenticated: "Oturum yok",
    invalid_name: "Grup adı çok kısa",
    not_found: "Grup bulunamadı",
    not_member: "Bu gruba erişimin yok",
    not_admin: "Bu işlem için grup yöneticisi olmalısın",
    admin_cannot_leave: "Grup yöneticisi gruptan ayrılamaz",
    cannot_remove_self: "Kendini gruptan çıkaramazsın",
    cannot_remove_admin: "Grup yöneticisi çıkarılamaz",
  }[reason];
}

function normalizeGroup(row = {}) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    code: row.code,
    weekly_target: Number(row.weekly_target ?? row.weeklyTarget ?? 0) || 0,
    weeklyTarget: Number(row.weekly_target ?? row.weeklyTarget ?? 0) || 0,
    weekly_questions: Number(row.weekly_questions ?? row.weeklyQuestions ?? 0) || 0,
    weeklyQuestions: Number(row.weekly_questions ?? row.weeklyQuestions ?? 0) || 0,
    created_by: row.created_by ?? row.owner_id,
    createdBy: row.created_by ?? row.owner_id,
    owner_id: row.owner_id ?? row.created_by,
    created_at: row.created_at,
    role: row.role || "member",
    member_count: Number(row.member_count ?? row.memberCount ?? 0) || 0,
    memberCount: Number(row.member_count ?? row.memberCount ?? 0) || 0,
    creator_name: row.creator_name ?? row.creatorName ?? null,
    creatorName: row.creator_name ?? row.creatorName ?? null,
  };
}

function normalizeMember(row = {}) {
  const weeklyQuestions = Number(row.weekly_questions ?? row.questions ?? 0) || 0;
  const name = row.display_name || row.name || "Öğrenci";
  return {
    user_id: row.user_id,
    id: row.user_id,
    name,
    display_name: name,
    avatar_url: row.avatar_url ?? null,
    role: row.role || "member",
    joined_at: row.joined_at,
    weekly_questions: weeklyQuestions,
    weeklyQuestions,
    questions: weeklyQuestions,
    weekly_xp: Number(row.weekly_xp ?? weeklyQuestions) || 0,
    rank: Number(row.rank) || 0,
    you: !!row.you,
    is_user: !!row.is_user || !!row.you,
    is_studying_now: !!row.is_studying_now,
    isStudyingNow: !!row.is_studying_now,
  };
}

async function rpc(name, params = {}, context = name) {
  const { data, error } = await supabase.rpc(name, params);
  if (error) {
    handleSupabaseError(error, context);
    throw error;
  }
  return data;
}

export async function createGroup(input = {}) {
  const payload = typeof input === "string" ? { name: input } : input;
  const { name, description = "", weeklyTarget, weekly_target } = payload;
  const target = weeklyTarget ?? weekly_target ?? 1000;
  try {
    if (!name?.trim()) throw new Error("Grup adı gerekli");
    const result = ensureOk(await rpc("create_group", {
      p_name: name.trim(),
      p_description: description,
      p_weekly_target: Math.max(0, Number(target) || 0),
    }, "createGroup"));
    return normalizeGroup(result);
  } catch (e) {
    handleSupabaseError(e, "createGroup");
    throw e;
  }
}

export async function joinByCode(code) {
  const trimmed = normalizeGroupCode(code);
  if (trimmed.length !== 6) throw new Error("Grup kodu 6 hane olmalı");
  JOIN_THROTTLE.check();
  try {
    const result = ensureOk(await rpc("join_group_by_code", { group_code: trimmed }, "joinByCode"));
    JOIN_THROTTLE.recordSuccess();
    return normalizeGroup(result);
  } catch (e) {
    JOIN_THROTTLE.recordFailure();
    handleSupabaseError(e, "joinByCode");
    throw e;
  }
}

export async function previewGroupByCode(code) {
  const trimmed = normalizeGroupCode(code);
  if (trimmed.length !== 6) throw new Error("Grup kodu 6 hane olmalı");
  JOIN_THROTTLE.check();
  try {
    const result = ensureOk(await rpc("preview_group_by_code", { group_code: trimmed }, "previewGroupByCode"));
    JOIN_THROTTLE.recordSuccess();
    return normalizeGroup(result);
  } catch (e) {
    JOIN_THROTTLE.recordFailure();
    handleSupabaseError(e, "previewGroupByCode");
    throw e;
  }
}

export async function listMyGroups() {
  try {
    const rows = await rpc("get_my_groups", {}, "listMyGroups");
    return (rows || []).map(normalizeGroup);
  } catch (e) {
    handleSupabaseError(e, "listMyGroups");
    throw e;
  }
}

export async function getGroupDetail(groupId) {
  try {
    if (!groupId) throw new Error("groupId is required");
    const result = ensureOk(await rpc("get_group_detail", { p_group_id: groupId }, "getGroupDetail"));
    const group = normalizeGroup(result.group);
    const members = rankGroupMembers((result.members || []).map(normalizeMember));
    return { group, members, goal: groupWeeklyGoalSummary(group, members) };
  } catch (e) {
    handleSupabaseError(e, "getGroupDetail");
    throw e;
  }
}

export async function leaveGroup(groupId) {
  try {
    if (!groupId) throw new Error("groupId is required");
    return ensureOk(await rpc("leave_group", { p_group_id: groupId }, "leaveGroup"));
  } catch (e) {
    handleSupabaseError(e, "leaveGroup");
    throw e;
  }
}

export async function removeGroupMember(groupId, userId) {
  try {
    if (!groupId || !userId) throw new Error("groupId and userId are required");
    return ensureOk(await rpc("remove_group_member", {
      p_group_id: groupId,
      p_user_id: userId,
    }, "removeGroupMember"));
  } catch (e) {
    handleSupabaseError(e, "removeGroupMember");
    throw e;
  }
}

export async function regenerateGroupCode(groupId) {
  try {
    if (!groupId) throw new Error("groupId is required");
    return ensureOk(await rpc("regenerate_group_code", { p_group_id: groupId }, "regenerateGroupCode"));
  } catch (e) {
    handleSupabaseError(e, "regenerateGroupCode");
    throw e;
  }
}

export async function deleteGroup(groupId) {
  try {
    if (!groupId) throw new Error("groupId is required");
    const { error } = await supabase.from("groups").delete().eq("id", groupId);
    if (error) {
      handleSupabaseError(error, "deleteGroup");
      throw error;
    }
    return true;
  } catch (e) {
    handleSupabaseError(e, "deleteGroup");
    throw e;
  }
}

export async function updateGroupSettings(groupId, { name, description, weeklyTarget, weekly_target } = {}) {
  try {
    if (!groupId) throw new Error("groupId is required");
    const target = weeklyTarget ?? weekly_target;
    const result = ensureOk(await rpc("update_group_settings", {
      p_group_id: groupId,
      p_name: name ?? null,
      p_description: description ?? null,
      p_weekly_target: target == null ? null : Math.max(0, Number(target) || 0),
    }, "updateGroupSettings"));
    return normalizeGroup(result);
  } catch (e) {
    handleSupabaseError(e, "updateGroupSettings");
    throw e;
  }
}

export async function groupLeaderboard(groupId, userId) {
  try {
    if (!groupId) throw new Error("groupId is required");
    const rows = await rpc("get_group_leaderboard", { group_uuid: groupId }, "groupLeaderboard");
    const list = rankGroupMembers((rows || []).map(normalizeMember)).map((row) => ({
      ...row,
      you: row.you || row.user_id === userId,
    }));
    const mine = list.find((row) => row.you);
    return { list, myRank: mine?.rank ?? null, myScore: mine?.weekly_questions ?? 0 };
  } catch (e) {
    handleSupabaseError(e, "groupLeaderboard");
    throw e;
  }
}
