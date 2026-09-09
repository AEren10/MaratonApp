import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

async function rpc(name, params) {
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw error;
  if (!data?.ok) throw Object.assign(new Error(data?.reason || "İşlem tamamlanamadı"), {
    code: data?.reason,
  });
  return data;
}

export async function listRouteCompanions(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from("route_companionships")
      .select("id, user_low_id, user_high_id, requested_by, status, created_at, accepted_at")
      .or(`user_low_id.eq.${userId},user_high_id.eq.${userId}`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const rows = data || [];
    const otherIds = [...new Set(rows.map((row) => row.user_low_id === userId
      ? row.user_high_id : row.user_low_id))];
    if (!otherIds.length) return [];
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", otherIds);
    if (profileError) throw profileError;
    const byId = new Map((profiles || []).map((profile) => [profile.id, profile]));
    return rows.map((row) => {
      const otherId = row.user_low_id === userId ? row.user_high_id : row.user_low_id;
      return {
        ...row,
        companion: byId.get(otherId) || { id: otherId, name: "Yol arkadaşı" },
        isIncoming: row.status === "pending" && row.requested_by !== userId,
      };
    });
  } catch (error) {
    handleSupabaseError(error, "listRouteCompanions");
    throw error;
  }
}

export const requestRouteCompanion = (otherId) =>
  rpc("request_route_companion", { p_other_id: otherId });

export const respondRouteCompanion = (id, accept) =>
  rpc("respond_route_companion", { p_id: id, p_accept: accept });

export const endRouteCompanion = (id) =>
  rpc("end_route_companion", { p_id: id });

export const getRouteCompanionDashboard = (id, weekStart = null) =>
  rpc("get_route_companion_dashboard", { p_id: id, p_week_start: weekStart });
