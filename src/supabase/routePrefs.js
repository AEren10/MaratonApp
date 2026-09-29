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

// Durak tasima haritasi (route_prefs.stop_moves): { logicalStopKey: "YYYY-MM-DD" }.
export async function getStopMoves(userId) {
  if (!userId || userId === "dev") return {};
  try {
    const { data, error } = await supabase
      .from("route_prefs")
      .select("stop_moves")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data?.stop_moves && typeof data.stop_moves === "object" ? data.stop_moves : {};
  } catch (e) {
    handleSupabaseError(e, "getStopMoves");
    throw e;
  }
}

export async function saveStopMoves(userId, moves) {
  if (!userId || userId === "dev") return moves;
  try {
    const { error } = await supabase
      .from("route_prefs")
      .upsert({ user_id: userId, stop_moves: moves || {}, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) throw error;
    return moves;
  } catch (e) {
    handleSupabaseError(e, "saveStopMoves");
    throw e;
  }
}
