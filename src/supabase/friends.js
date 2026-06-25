import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertUUID(val, label = "id") {
  if (!val || !UUID_RE.test(val)) throw new Error(`Invalid ${label}`);
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum yok");
    if (addresseeId === user.id) throw new Error("Kendinize istek gönderemezsiniz");
    const { data: existing } = await supabase
      .from("friendships")
      .select("id, status")
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`)
      .maybeSingle();
    if (existing?.status === "blocked") throw new Error("Bu kullanıcıyla etkileşim kurulamaz");
    if (existing?.status === "accepted") throw new Error("Zaten arkadaşsınız");
    if (existing?.status === "pending") throw new Error("Zaten bekleyen istek var");
    const { data, error } = await supabase
      .from("friendships")
      .insert({ requester_id: user.id, addressee_id: addresseeId })
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "sendFriendRequest");
    throw e;
  }
}

export async function respondToRequest(friendshipId, accept, userId) {
  try {
    if (!userId || !UUID_RE.test(userId)) throw new Error("Invalid userId");
    const { data, error } = await supabase
      .from("friendships")
      .update({
        status: accept ? "accepted" : "declined",
        responded_at: new Date().toISOString(),
      })
      .eq("id", friendshipId)
      .eq("addressee_id", userId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
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
  const { data, error } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (data?.referral_code) return data.referral_code;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  let attempts = 0;
  while (attempts < 5) {
    const { error: upErr } = await supabase
      .from("profiles")
      .update({ referral_code: code })
      .eq("id", userId);
    if (!upErr) return code;
    code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    attempts++;
  }
  throw new Error("Kod oluşturulamadı");
}

export async function blockUser(targetId) {
  try {
    assertUUID(targetId, "targetId");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum yok");
    if (targetId === user.id) throw new Error("Kendinizi engelleyemezsiniz");
    const { data: existing } = await supabase
      .from("friendships")
      .select("id")
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${user.id})`)
      .maybeSingle();
    if (existing) {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "blocked" })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("friendships")
        .insert({ requester_id: user.id, addressee_id: targetId, status: "blocked" });
      if (error) throw error;
    }
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
  const { data: target, error: lookupErr } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("referral_code", upper)
    .maybeSingle();
  if (lookupErr) throw lookupErr;
  if (!target) throw new Error("Bu koda ait kullanıcı bulunamadı");
  if (target.id === user.id) throw new Error("Kendi kodunu kullanamazsın");
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status")
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${target.id}),and(requester_id.eq.${target.id},addressee_id.eq.${user.id})`)
    .maybeSingle();
  if (existing?.status === "blocked") throw new Error("Bu kullanıcıyla etkileşim kurulamaz");
  if (existing?.status === "accepted") throw new Error("Zaten arkadaşsınız");
  if (existing?.status === "pending") throw new Error("Zaten bekleyen istek var");
  const { data, error } = await supabase
    .from("friendships")
    .insert({ requester_id: user.id, addressee_id: target.id })
    .select()
    .maybeSingle();
  if (error) throw error;
  return { friendship: data, targetName: target.name };
}
