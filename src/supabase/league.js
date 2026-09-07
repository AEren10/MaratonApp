import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// A) League: gerçek veri kaynağı — güvenli RPC kontratları.
// Her fonksiyon { list, myRank, myScore } döner.
// list: [{ user_id, name, avatar_url, weekly_xp, questions, trials, rank, you }]

function withRanks(rows, userId) {
  return rows.map((r, i) => ({
    ...r,
    weekly_xp: r.weekly_xp || 0,
    rank: i + 1,
    you: r.user_id === userId,
  }));
}

// Global ilk N + kullanıcının gerçek sırası (top dışındaysa bile).
export async function fetchGlobalTop(userId, limit = 50) {
  if (!userId || typeof userId !== "string") throw new Error("Invalid userId");
  const safeLimit = Math.min(Math.max(1, Number(limit) || 50), 100);
  const { data, error } = await supabase.rpc("get_global_leaderboard", {
    limit_count: safeLimit,
  });
  if (error) throw error;

  const list = (data || []).map((r) => ({
    ...r,
    weekly_xp: r.weekly_xp || 0,
    rank: Number(r.rank) || 0,
    you: r.you ?? r.user_id === userId,
  }));
  const mine = list.find((r) => r.you);

  // GERÇEK kohort büyüklüğü. list.length kullanılamaz: bu liste en fazla
  // safeLimit satır içerir, dolayısıyla terfi/düşme bölgesi yanlış hesaplanır
  // (global ilk 50'deki bir kullanıcıya "düşme bölgesi" yazıyordu).
  // RPC henüz uygulanmamış bir veritabanında null döner; çağıran taraf
  // o zaman bölge göstermez.
  let total = null;
  try {
    const { data: totalData, error: totalError } = await supabase.rpc("get_leaderboard_total");
    if (!totalError) total = Number(totalData) || null;
  } catch (_) {}

  return { list, total, myRank: mine?.rank ?? null, myScore: mine?.weekly_xp ?? 0 };
}

// Sadece arkadaşlar + kullanıcı, haftalık XP'ye göre sıralı.
export async function fetchFriendsLeague(userId) {
  try {
    if (!userId || typeof userId !== "string") throw new Error("Invalid userId");
    const { data, error } = await supabase.rpc("get_friends_leaderboard");
    if (error) throw error;

    const list = withRanks(data || [], userId);
    const mine = list.find((r) => r.you);
    // Arkadaş liginde liste EKSİKSİZ — kohort zaten bu kadar.
    return { list, total: list.length, myRank: mine?.rank ?? null, myScore: mine?.weekly_xp ?? 0 };
  } catch (e) {
    handleSupabaseError(e, "fetchFriendsLeague");
    throw e;
  }
}
