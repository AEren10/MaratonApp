import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// E) Kullanıcının ders bazlı anonim percentile'ı.
// my_percentiles() RPC → sadece kendi satırların (başka ID dönmez).
// Döner: { [subjectKey]: { percentile, avgNet } }
export async function getMyPercentiles() {
  try {
    const { data, error } = await supabase.rpc("my_percentiles");
    if (error) throw error;
    const map = {};
    (data || []).forEach((r) => {
      map[r.subject] = { percentile: r.percentile ?? 0, avgNet: Number(r.avg_net) || 0 };
    });
    return map;
  } catch (e) {
    handleSupabaseError(e, "getMyPercentiles");
    throw e;
  }
}

let lastRefresh = 0;
const REFRESH_COOLDOWN = 3600000; // 1 saat

export async function refreshPercentilesIfStale() {
  if (Date.now() - lastRefresh < REFRESH_COOLDOWN) return;
  try {
    const { error } = await supabase.rpc("refresh_percentiles");
    if (!error) lastRefresh = Date.now();
  } catch {
    // Sessizce geç — view bayat kalırsa da crash olmasın
  }
}
