import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// Haftalik ders programi — weekly_class_schedule (gun basina tek satir).
// Tablo canli DB'de henuz yoksa (migration uygulanmadi) cagiran taraf
// yerel kopyaya duser; bu modul hatayi yutmaz, firlatir.

const COLUMNS = "weekday, kind, subjects, minutes, updated_at";
const TABLE_MISSING = new Set(["42P01", "PGRST205"]);

function report(e, where) {
  if (!TABLE_MISSING.has(e?.code)) handleSupabaseError(e, where);
}

export async function getClassSchedule(userId) {
  try {
    const { data, error } = await supabase
      .from("weekly_class_schedule")
      .select(COLUMNS)
      .eq("user_id", userId)
      .order("weekday", { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) {
    report(e, "getClassSchedule");
    throw e;
  }
}

export async function saveClassSchedule(userId, schedule) {
  try {
    const rows = (schedule || []).map((d) => ({
      user_id: userId,
      weekday: d.weekday,
      kind: d.kind,
      subjects: d.subjects,
      minutes: d.minutes,
    }));
    const { error } = await supabase
      .from("weekly_class_schedule")
      .upsert(rows, { onConflict: "user_id,weekday" });
    if (error) throw error;
    return true;
  } catch (e) {
    report(e, "saveClassSchedule");
    throw e;
  }
}
