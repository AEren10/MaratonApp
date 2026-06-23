import { supabase } from "./client";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertUUID(val, label = "id") {
  if (!val || !UUID_RE.test(val)) throw new Error(`Invalid ${label}`);
}

export async function searchUsers(query) {
  if (!query || query.length < 3) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .ilike("name", `%${query}%`)
    .limit(20);
  if (error) throw error;
  return data;
}

export async function sendFriendRequest(addresseeId) {
  assertUUID(addresseeId, "addresseeId");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum yok");
  const { data, error } = await supabase
    .from("friendships")
    .insert({ requester_id: user.id, addressee_id: addresseeId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function respondToRequest(friendshipId, accept, userId) {
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
    .single();
  if (error) throw error;
  return data;
}

export async function listIncomingRequests(userId) {
  assertUUID(userId, "userId");
  const { data, error } = await supabase
    .from("friendships")
    .select("*, requester:profiles!friendships_requester_id_fkey(id, name, avatar_url)")
    .eq("addressee_id", userId)
    .eq("status", "pending");
  if (error) throw error;
  return data;
}

export async function listFriends(userId) {
  assertUUID(userId, "userId");
  const { data, error } = await supabase
    .from("friendships")
    .select("*, requester:profiles!friendships_requester_id_fkey(id, name, avatar_url), addressee:profiles!friendships_addressee_id_fkey(id, name, avatar_url)")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "accepted");
  if (error) throw error;
  return (data || []).map((f) => {
    const friend = f.requester_id === userId ? f.addressee : f.requester;
    return { friendshipId: f.id, ...friend };
  });
}

export async function unfriend(friendshipId, userId) {
  let query = supabase.from("friendships").delete().eq("id", friendshipId);
  if (userId) query = query.or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  const { error } = await query;
  if (error) throw error;
}
