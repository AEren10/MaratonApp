import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

function clientEventId(event) {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${event}:${stamp}:${rand}`;
}

export const recordRetentionEvent = async (userId, event, props = {}, source = null) => {
  if (!userId || userId === "dev" || !event) return null;
  const row = {
    user_id: userId,
    event,
    source,
    props: props && typeof props === "object" ? props : {},
    client_event_id: props?.clientEventId || clientEventId(event),
    occurred_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("retention_events")
      .insert(row)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "recordRetentionEvent");
    return null;
  }
};
