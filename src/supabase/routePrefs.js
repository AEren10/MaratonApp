import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// Rota tercihleri (route_prefs): gunluk rutinler. Satir yoksa bos liste.
export async function getRouteHabits(userId) {
  if (!userId || userId === "dev") return [];
  try {
    const { data, error } = await supabase
      .from("route_prefs")
      .select("habits")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return Array.isArray(data?.habits) ? data.habits : [];
  } catch (e) {
    handleSupabaseError(e, "getRouteHabits");
    throw e;
  }
}

export async function saveRouteHabits(userId, habits) {
  if (!userId || userId === "dev") return habits;
  const clean = (habits || []).map((h) => ({ key: String(h.key), questions: Math.round(Number(h.questions) || 0) }));
  try {
    const { error } = await supabase
      .from("route_prefs")
      .upsert({ user_id: userId, habits: clean, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) throw error;
    return clean;
  } catch (e) {
    handleSupabaseError(e, "saveRouteHabits");
    throw e;
  }
}
