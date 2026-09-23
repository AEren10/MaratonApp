import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { listMyGroups, groupLeaderboard } from "../supabase/groups";

export function useMyGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [primaryGroup, setPrimaryGroup] = useState(null);
  const [standing, setStanding] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const list = await listMyGroups();
      const safeList = list || [];
      setGroups(safeList);
      const primary = safeList[0] || null;
      setPrimaryGroup(primary);

      if (primary?.id) {
        try {
          const lb = await groupLeaderboard(primary.id, user.id);
          const leader = lb.list?.[0];
          const mine = lb.list?.find((m) => m.you);
          if (mine) {
            const isLeader = mine.rank === 1;
            const second = lb.list?.[1];
            const diff = isLeader
              ? (second ? Math.max(0, mine.weekly_questions - second.weekly_questions) : 0)
              : (leader ? Math.max(0, leader.weekly_questions - mine.weekly_questions) : 0);
            setStanding({
              rank: mine.rank,
              isLeader,
              diff,
              leaderName: leader?.name || "Lider",
              myQuestions: mine.weekly_questions,
              memberCount: lb.list?.length || primary.member_count,
            });
          } else {
            setStanding(null);
          }
        } catch {
          setStanding(primary.user_rank ? { rank: primary.user_rank, isLeader: primary.user_rank === 1 } : null);
        }
      } else {
        setStanding(null);
      }
    } catch {
      // Cevrimdisi veya hata durumunda sessizce gec
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    groups,
    primaryGroup,
    standing,
    loading,
    refresh,
    hasGroup: Boolean(groups.length),
  };
}
