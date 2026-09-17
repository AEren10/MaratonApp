import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";
import { SCREENS } from "../constants/screens";

const NOTIFICATION_COLUMNS = "id, user_id, kind, title, body, route_name, route_params, color_key, metadata, read_at, created_at";

export const NOTIFICATION_KINDS = {
  ROUTE_STOP_OPENED: "route_stop_opened",
  TRIAL_ANALYSIS_READY: "trial_analysis_ready",
  WEEKLY_SUMMARY_READY: "weekly_summary_ready",
};

function normalizeNotification(row = {}) {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    title: row.title,
    body: row.body || "",
    routeName: row.route_name || null,
    routeParams: row.route_params || {},
    colorKey: row.color_key || "accent",
    metadata: row.metadata || {},
    readAt: row.read_at || null,
    createdAt: row.created_at || null,
    read: !!row.read_at,
  };
}

function toNotificationRow(input = {}) {
  return {
    user_id: input.user_id || input.userId,
    kind: input.kind,
    title: input.title,
    body: input.body || null,
    route_name: input.route_name ?? input.routeName ?? null,
    route_params: input.route_params ?? input.routeParams ?? {},
    color_key: input.color_key || input.colorKey || "accent",
    metadata: input.metadata || {},
  };
}

export async function listNotifications(userId, { limit = 50 } = {}) {
  if (!userId || userId === "dev") return [];
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select(NOTIFICATION_COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(normalizeNotification);
  } catch (e) {
    handleSupabaseError(e, "listNotifications");
    throw e;
  }
}

export async function createNotification(notification) {
  const row = toNotificationRow(notification);
  if (!row.user_id) throw new Error("userId is required");
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert(row)
      .select(NOTIFICATION_COLUMNS)
      .single();
    if (error) throw error;
    return normalizeNotification(data);
  } catch (e) {
    handleSupabaseError(e, "createNotification");
    throw e;
  }
}

export async function markNotificationRead(id, userId) {
  if (!id) throw new Error("id is required");
  if (!userId) throw new Error("userId is required");
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .select(NOTIFICATION_COLUMNS)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("notification_not_found");
    return normalizeNotification(data);
  } catch (e) {
    handleSupabaseError(e, "markNotificationRead");
    throw e;
  }
}

export async function markAllNotificationsRead(userId) {
  if (!userId) throw new Error("userId is required");
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "markAllNotificationsRead");
    throw e;
  }
}

export function buildRouteStopNotification(userId, { title, body, routeParams = {}, metadata = {} } = {}) {
  return {
    userId,
    kind: NOTIFICATION_KINDS.ROUTE_STOP_OPENED,
    title: title || "Yeni rota durağın açıldı.",
    body: body || "Bugünün durağı hazır. Rotaya dönüp sıradaki adımı görebilirsin.",
    routeName: SCREENS.PLAN_DETAIL,
    routeParams,
    colorKey: "accent",
    metadata,
  };
}

export function buildTrialAnalysisNotification(userId, { trialId, title, body, metadata = {} } = {}) {
  return {
    userId,
    kind: NOTIFICATION_KINDS.TRIAL_ANALYSIS_READY,
    title: title || "Deneme analizin hazır.",
    body: body || "Son denemendeki eğilimler ve rota etkisi işlendi.",
    routeName: trialId ? SCREENS.TRIAL_DETAIL : SCREENS.TRIAL_RECORDS,
    routeParams: trialId ? { id: trialId } : {},
    colorKey: "accentBright",
    metadata,
  };
}

export function buildWeeklySummaryNotification(userId, { period = "week", title, body, metadata = {} } = {}) {
  return {
    userId,
    kind: NOTIFICATION_KINDS.WEEKLY_SUMMARY_READY,
    title: title || "Hafta özetin hazır.",
    body: body || "Bu haftanın çalışma ritmi ve rota ilerlemesi hazırlandı.",
    routeName: SCREENS.SUMMARY,
    routeParams: { period },
    colorKey: "green",
    metadata,
  };
}
