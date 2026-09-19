import { useCallback, useEffect, useState } from "react";

import { getGroupDetail } from "../supabase/groups";
import { captureError } from "../lib/errorReporting";

export function useGroupDetail(groupId, { autoLoad = true } = {}) {
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [goal, setGoal] = useState({ weekly_questions: 0, weekly_target: 0, progress: 0, remaining: 0 });
  const [loading, setLoading] = useState(autoLoad && !!groupId);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async ({ refresh = false } = {}) => {
    if (!groupId) {
      setGroup(null);
      setMembers([]);
      setLoading(false);
      setRefreshing(false);
      return null;
    }
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const detail = await getGroupDetail(groupId);
      setGroup(detail.group);
      setMembers(detail.members);
      setGoal(detail.goal);
      setError(null);
      return detail;
    } catch (e) {
      setError(e);
      captureError(e, { context: "group_detail_load", groupId });
      throw e;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (!autoLoad || !groupId) return undefined;
    let cancelled = false;
    load().catch((e) => {
      if (!cancelled) setError(e);
    });
    return () => { cancelled = true; };
  }, [autoLoad, groupId, load]);

  return {
    group,
    members,
    leaderboard: members,
    goal,
    loading,
    refreshing,
    error,
    reload: load,
    refresh: () => load({ refresh: true }),
    setGroup,
    setLeaderboard: setMembers,
  };
}
