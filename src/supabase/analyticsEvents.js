import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

export const insertAnalyticsEvents = async (events) => {
  if (!events?.length) return;
  const { error } = await supabase.from("analytics_events").insert(events);
  if (error) {
    handleSupabaseError(error, "insertAnalyticsEvents");
    throw error;
  }
};
