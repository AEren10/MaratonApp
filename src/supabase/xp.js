import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

export async function logXP(userId, amount, action) {
  if (!userId || userId === "dev" || !amount) return;
  try {
    const { error } = await supabase.from("xp_events").insert({ user_id: userId, amount, action });
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "logXP");
    throw e;
  }
}

const MAX_XP_ROWS = 5000;

function sumAmounts(rows) {
  if (!Array.isArray(rows)) return 0;
  return rows.reduce((acc, r) => acc + (Number(r?.amount) || 0), 0);
}

function isMissingFunction(e) {
  const msg = e?.message || "";
  return e?.code === "PGRST202" || msg.includes("Could not find the function");
}

// Geri düşüş: my_xp_totals RPC'si henüz uygulanmamış bir veritabanında
// (migration 045) istemci tarafında toplar. Böylece migration sırası ne
// olursa olsun XP hiçbir zaman 0'a düşmez.
async function totalsFromClient(userId) {
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("xp_events")
    .select("amount, created_at")
    .eq("user_id", userId)
    .limit(MAX_XP_ROWS);
  if (error) throw error;

  const rows = data || [];
  return {
    total: sumAmounts(rows),
    weekly: sumAmounts(rows.filter((r) => new Date(r.created_at) >= monday)),
  };
}

// Tek çağrıda hem toplam hem haftalık XP. Toplama sunucuda yapılır —
// önceden binlerce satır istemciye indiriliyordu.
export async function getXPTotals(userId) {
  if (!userId || userId === "dev") return { total: 0, weekly: 0 };
  try {
    const { data, error } = await supabase.rpc("my_xp_totals");
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return {
      total: Number(row?.total) || 0,
      weekly: Number(row?.weekly) || 0,
    };
  } catch (e) {
    if (isMissingFunction(e)) {
      try {
        return await totalsFromClient(userId);
      } catch (inner) {
        handleSupabaseError(inner, "getXPTotals:fallback");
        return { total: 0, weekly: 0 };
      }
    }
    handleSupabaseError(e, "getXPTotals");
    return { total: 0, weekly: 0 };
  }
}

export async function getTotalXP(userId) {
  return (await getXPTotals(userId)).total;
}

export async function getWeeklyXP(userId) {
  return (await getXPTotals(userId)).weekly;
}
