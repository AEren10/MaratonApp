import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";
import { dateKey } from "../lib/dateUtils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function listMyChallenges(userId) {
  try {
    if (!userId || !UUID_RE.test(userId)) throw new Error("Invalid userId");
    const { data, error } = await supabase
      .from("challenges")
      .select("*, creator:profiles!challenges_creator_id_fkey(id, name, avatar_url), opponent:profiles!challenges_opponent_id_fkey(id, name, avatar_url)")
      .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "listMyChallenges");
    throw e;
  }
}

export async function getActiveChallengeCount(userId) {
  try {
    if (!userId || !UUID_RE.test(userId)) throw new Error("Invalid userId");
    const { count, error } = await supabase
      .from("challenges")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", userId)
      .eq("status", "active");
    if (error) throw error;
    return count ?? 0;
  } catch (e) {
    handleSupabaseError(e, "getActiveChallengeCount");
    throw e;
  }
}

const VALID_METRICS = ["questions", "study_minutes"];

export async function createChallenge({ opponentId, metric, target, days = 7 }) {
  try {
    if (!opponentId || !UUID_RE.test(opponentId)) throw new Error("Invalid opponentId");
    if (!VALID_METRICS.includes(metric)) throw new Error("Invalid metric");
    if (!Number.isFinite(target) || target <= 0) throw new Error("Invalid target");
    if (!Number.isFinite(days) || days < 1 || days > 30) throw new Error("Invalid days");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum yok");
    const today = new Date();
    const endsOn = new Date(today.getTime() + days * 86400000);
    if (opponentId === user.id) throw new Error("Kendinize challenge gönderemezsiniz");
    const { data: blocked } = await supabase
      .from("friendships")
      .select("id")
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${opponentId}),and(requester_id.eq.${opponentId},addressee_id.eq.${user.id})`)
      .eq("status", "blocked")
      .maybeSingle();
    if (blocked) throw new Error("Bu kullanıcıyla etkileşim kurulamaz");
    const { data, error } = await supabase
      .from("challenges")
      .insert({
        creator_id: user.id,
        opponent_id: opponentId,
        metric,
        target,
        status: "pending",
        starts_on: dateKey(today),
        ends_on: dateKey(endsOn),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "createChallenge");
    throw e;
  }
}

export async function cancelChallenge(id, userId) {
  try {
    if (!id || !UUID_RE.test(id)) throw new Error("Invalid challenge id");
    if (!userId) throw new Error("userId is required");
    const { data, error } = await supabase.rpc("cancel_challenge", { p_id: id });
    if (error) throw error;
    if (!data?.ok) throw new Error("Challenge iptal edilemedi");
  } catch (e) {
    handleSupabaseError(e, "cancelChallenge");
    throw e;
  }
}

export async function respondToChallenge(id, accept, userId) {
  try {
    if (!id || !UUID_RE.test(id)) throw new Error("Invalid challenge id");
    if (!userId) throw new Error("userId is required");
    const { data, error } = await supabase.rpc("respond_to_challenge", {
      p_id: id,
      p_accept: !!accept,
    });
    if (error) throw error;
    if (!data?.ok) throw new Error("Challenge bulunamadı veya zaten yanıtlanmış");
    return data;
  } catch (e) {
    handleSupabaseError(e, "respondToChallenge");
    throw e;
  }
}

// NOT: Challenge tamamlanması ve kazanan seçimi ayrı bir istemci çağrısı
// DEĞİL. bump_challenge_progress hedefe ulaşıldığında ikisini de sunucuda
// yapıyor (bkz. 20260908150000 migration).

export async function checkExpiredChallenges(userId) {
  try {
    if (!userId) return 0;
    const { data, error } = await supabase.rpc("finalize_expired_challenges");
    if (error) throw error;
    return data || 0;
  } catch (e) {
    handleSupabaseError(e, "checkExpiredChallenges");
    return 0;
  }
}

export async function bumpMyProgress(id, side, value) {
  try {
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
  } catch (e) {
    handleSupabaseError(e, "bumpMyProgress");
    throw e;
  }
}
