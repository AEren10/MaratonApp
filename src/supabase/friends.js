import { supabase } from "./client";

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
  const { data, error } = await supabase
    .from("friendships")
    .insert({ addressee_id: addresseeId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function respondToRequest(friendshipId, accept) {
  const { data, error } = await supabase
    .from("friendships")
    .update({
      status: accept ? "accepted" : "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", friendshipId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listIncomingRequests(userId) {
  const { data, error } = await supabase
    .from("friendships")
    .select("*, requester:profiles!friendships_requester_id_fkey(id, name, avatar_url)")
    .eq("addressee_id", userId)
    .eq("status", "pending");
  if (error) throw error;
  return data;
}

export async function listFriends(userId) {
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

export async function unfriend(friendshipId) {
  const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
  if (error) throw error;
}
