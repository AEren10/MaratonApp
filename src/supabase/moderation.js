import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// Kullanici adi / grup adi bildirimi (Apple 1.2). Fotograf icin reportAvatar
// ayri: iki kisi bildirince fotograf hemen kalkar. reason: name|photo|harassment|spam|other
export async function reportContent(targetType, targetId, reason = "other") {
  const { data, error } = await supabase.rpc("report_content", {
    p_target_type: targetType,
    p_target_id: targetId,
    p_reason: reason,
  });
  if (error) {
    handleSupabaseError(error, "reportContent");
    throw error;
  }
  return data;
}
