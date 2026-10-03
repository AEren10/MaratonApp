import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertUUID(val, label = "id") {
  if (!val || !UUID_RE.test(val)) throw new Error(`Invalid ${label}`);
}

async function invokeFriendAction(body) {
  const { data, error } = await supabase.functions.invoke("friend-actions", { body });
  if (error) {
    let detail = null;
    try { detail = await error.context?.json?.(); } catch (_) {}
    throw new Error(detail?.error || error.message || "İşlem tamamlanamadı.");
  }
  return data;
}

export async function searchUsers(query) {
  try {
    if (!query || query.length < 3) return [];
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .ilike("name", `%${query}%`)
      .limit(20);
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "searchUsers");
    throw e;
  }
}

export async function sendFriendRequest(addresseeId) {
  try {
    assertUUID(addresseeId, "addresseeId");
    const data = await invokeFriendAction({ action: "send", addresseeId });
    return data?.friendship || null;
  } catch (e) {
    handleSupabaseError(e, "sendFriendRequest");
    throw e;
  }
}

export async function respondToRequest(friendshipId, accept, userId) {
  try {
    assertUUID(friendshipId, "friendshipId");
    if (!userId || !UUID_RE.test(userId)) throw new Error("Invalid userId");
    const data = await invokeFriendAction({ action: "respond", friendshipId, accept: !!accept });
    return data?.friendship || null;
  } catch (e) {
    handleSupabaseError(e, "respondToRequest");
    throw e;
  }
}

export async function listIncomingRequests(userId) {
  try {
    assertUUID(userId, "userId");
    const { data, error } = await supabase
      .from("friendships")
      .select("*, requester:profiles!friendships_requester_id_fkey(id, name, avatar_url)")
      .eq("addressee_id", userId)
      .eq("status", "pending");
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "listIncomingRequests");
    throw e;
  }
}

export async function listOutgoingRequests(userId) {
  try {
    assertUUID(userId, "userId");
    const { data, error } = await supabase
      .from("friendships")
      .select("*, addressee:profiles!friendships_addressee_id_fkey(id, name, avatar_url)")
      .eq("requester_id", userId)
      .eq("status", "pending");
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "listOutgoingRequests");
    throw e;
  }
}

export async function cancelRequest(friendshipId, userId) {
  if (!userId) throw new Error("userId is required");
  try {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId)
      .eq("requester_id", userId)
      .eq("status", "pending");
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "cancelRequest");
    throw e;
  }
}

export async function listFriends(userId) {
  try {
    assertUUID(userId, "userId");
    const { data, error } = await supabase
      .from("friendships")
      .select("*, requester:profiles!friendships_requester_id_fkey(id, name, avatar_url), addressee:profiles!friendships_addressee_id_fkey(id, name, avatar_url)")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq("status", "accepted");
    if (error) throw error;
    return (data || []).map((f) => {
      const friend = f.requester_id === userId ? f.addressee : f.requester;
      if (!friend) return null;
      return { friendshipId: f.id, ...friend };
    }).filter(Boolean);
  } catch (e) {
    handleSupabaseError(e, "listFriends");
    throw e;
  }
}

export async function unfriend(friendshipId, userId) {
  if (!userId) throw new Error("userId is required");
  try {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "unfriend");
    throw e;
  }
}

export async function getMyFriendCode(userId) {
  if (!userId || userId === "dev") return null;
  const { data, error } = await supabase.rpc("get_or_create_referral_code");
  if (error) throw error;
  if (!data) throw new Error("Kod oluşturulamadı");
  return data;
}

export async function blockUser(targetId) {
  try {
    assertUUID(targetId, "targetId");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum yok");
    if (targetId === user.id) throw new Error("Kendinizi engelleyemezsiniz");
    const { error } = await supabase.rpc("block_user", { p_target: targetId });
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "blockUser");
    throw e;
  }
}

export async function unblockUser(targetId) {
  try {
    assertUUID(targetId, "targetId");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum yok");
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("requester_id", user.id)
      .eq("addressee_id", targetId)
      .eq("status", "blocked");
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "unblockUser");
    throw e;
  }
}

export async function listBlockedUsers(userId) {
  try {
    assertUUID(userId, "userId");
    const { data, error } = await supabase
      .from("friendships")
      .select("addressee_id, addressee:profiles!friendships_addressee_id_fkey(id, name, avatar_url)")
      .eq("requester_id", userId)
      .eq("status", "blocked");
    if (error) throw error;
    return (data || []).map((r) => r.addressee).filter(Boolean);
  } catch (e) {
    handleSupabaseError(e, "listBlockedUsers");
    throw e;
  }
}

export async function isBlocked(userId, targetId) {
  try {
    const { data } = await supabase
      .from("friendships")
      .select("id")
      .or(`and(requester_id.eq.${userId},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${userId})`)
      .eq("status", "blocked")
      .maybeSingle();
    return !!data;
  } catch { return false; }
}

export async function sendFriendRequestByCode(code) {
  const upper = code.trim().toUpperCase();
  if (!upper || upper.length < 4) throw new Error("Geçersiz kod");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum yok");
  // Kod araması SUNUCUDA. Eskiden istemci profiles'ta referral_code ile
  // arama yapıyordu; bu, davet kodu sütununun tüm kullanıcılar için okunabilir
  // olmasını gerektiriyordu (kod numaralandırma + profil sızıntısı).
  const { data: lookup, error: lookupErr } = await supabase
    .rpc("find_user_by_friend_code", { code: upper });
  if (lookupErr) throw lookupErr;
  if (!lookup?.ok) {
    if (lookup?.reason === "self") throw new Error("Kendi kodunu kullanamazsın");
    if (lookup?.reason === "invalid_code") throw new Error("Geçersiz kod");
    throw new Error("Bu koda ait kullanıcı bulunamadı");
  }
  const target = { id: lookup.id, name: lookup.name };
  const friendship = await sendFriendRequest(target.id);
  return { friendship, targetName: target.name };
}
