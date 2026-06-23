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
