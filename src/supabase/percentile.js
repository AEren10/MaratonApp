import { supabase } from "./client";

// E) Kullanıcının ders bazlı anonim percentile'ı.
// my_percentiles() RPC → sadece kendi satırların (başka ID dönmez).
// Döner: { [subjectKey]: { percentile, avgNet } }
export async function getMyPercentiles() {
  const { data, error } = await supabase.rpc("my_percentiles");
  if (error) throw error;
  const map = {};
  (data || []).forEach((r) => {
    map[r.subject] = { percentile: r.percentile ?? 0, avgNet: Number(r.avg_net) || 0 };
  });
  return map;
}
