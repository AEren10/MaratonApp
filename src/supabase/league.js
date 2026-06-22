import { supabase } from "./client";
import { listFriends } from "./friends";
import { handleSupabaseError } from "./handleError";

// A) League: gerçek veri kaynağı — leaderboard_weekly view'ı.
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
  const { data, error } = await supabase
    .from("leaderboard_weekly")
    .select("user_id, name, avatar_url, weekly_xp, questions, trials")
    .order("weekly_xp", { ascending: false })
    .limit(safeLimit);
  if (error) throw error;

  const list = withRanks(data || [], userId);
  const mine = list.find((r) => r.you);
  let myScore = mine?.weekly_xp ?? 0;
  let myRank = mine?.rank ?? null;

  // Kullanıcı top listede yoksa kendi skoru + sırasını ayrıca hesapla.
  if (!mine && userId) {
    const { data: own, error: ownErr } = await supabase
      .from("leaderboard_weekly")
      .select("weekly_xp")
      .eq("user_id", userId)
      .maybeSingle();
    handleSupabaseError(ownErr, "fetchGlobalTop:ownScore");
    myScore = own?.weekly_xp ?? 0;
    const { count, error: countErr } = await supabase
      .from("leaderboard_weekly")
      .select("user_id", { count: "exact", head: true })
      .gt("weekly_xp", myScore);
    handleSupabaseError(countErr, "fetchGlobalTop:ownRank");
    myRank = (count ?? 0) + 1;
  }

  return { list, myRank, myScore };
}

// Sadece arkadaşlar + kullanıcı, haftalık XP'ye göre sıralı.
export async function fetchFriendsLeague(userId) {
  if (!userId || typeof userId !== "string") throw new Error("Invalid userId");
  const friends = await listFriends(userId);
  const ids = [...new Set([userId, ...friends.map((f) => f.id)])];
  if (ids.length === 0) return { list: [], myRank: null, myScore: 0 };

  const { data, error } = await supabase
    .from("leaderboard_weekly")
    .select("user_id, name, avatar_url, weekly_xp, questions, trials")
    .in("user_id", ids)
    .order("weekly_xp", { ascending: false });
  if (error) throw error;

  const list = withRanks(data || [], userId);
  const mine = list.find((r) => r.you);
  return { list, myRank: mine?.rank ?? null, myScore: mine?.weekly_xp ?? 0 };
}
