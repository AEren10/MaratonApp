import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";
import { startOfWeekTR } from "../lib/dateUtils";

/**
 * XP defterine yazar. Miktar SUNUCUDA kırpılır.
 *
 * Eskiden istemci xp_events'e istediği miktarı yazabiliyordu ve lig görünümü
 * bu defteri topluyordu — sıralama doğrudan manipüle edilebiliyordu. Artık
 * yazma yalnızca award_xp RPC'siyle: bilinmeyen eylem reddediliyor, miktar
 * eylem başına tavana ve günlük kotaya kırpılıyor.
 *
 * @returns sunucunun gerçekten yazdığı miktar (kırpılmış olabilir)
 */
export async function logXP(userId, amount, action) {
  if (!userId || userId === "dev" || !amount) return 0;
  try {
    const { data, error } = await supabase.rpc("award_xp", {
      p_action: action,
      p_amount: Math.round(amount),
    });
    if (error) throw error;
    return data?.amount ?? 0;
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
const PAGE_SIZE = 1000;

async function totalsFromClient(userId) {
  // Hafta sınırı SUNUCUYLA AYNI olmalı: sunucu date_trunc('week', ... TR)
  // kullanıyor. Burada cihazın yerel Pazartesi'si hesaplanıyordu; yurtdışındaki
  // kullanıcıda haftalık XP ile lig sıralaması uyuşmuyordu.
  const weekStart = startOfWeekTR();

  // Haftalık: sunucu tarafında filtrele, küçük sonuç döner.
  const weeklyRes = await supabase
    .from("xp_events")
    .select("amount")
    .eq("user_id", userId)
    .gte("created_at", weekStart);
  if (weeklyRes.error) throw weeklyRes.error;

  // Toplam: sayfalayarak topla. Önceden tek .limit(5000) vardı ve SIRALAMA
  // YOKTU — 5000'den fazla olayı olan kullanıcıda Postgres rastgele 5000 satır
  // döndürüyor, toplam XP sessizce eksik çıkıyordu.
  let total = 0;
  for (let from = 0; from < MAX_XP_ROWS; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("xp_events")
      .select("amount")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = data || [];
    total += sumAmounts(page);
    if (page.length < PAGE_SIZE) break;
  }

  return { total, weekly: sumAmounts(weeklyRes.data || []) };
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

