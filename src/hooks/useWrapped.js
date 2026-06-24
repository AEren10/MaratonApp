import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectTrials } from "../store/slices/trialSlice";
import { selectXP, selectWeeklyXP } from "../store/slices/gamificationSlice";
import { selectStreak } from "../store/slices/studyLogSlice";
import { useAuth } from "../contexts/AuthContext";
import { getStudyLogs } from "../supabase/studyLogs";
import { computeWrapped, getWrappedPeriod, getPeriodRange } from "../lib/wrappedStats";

export function useWrapped() {
  const { user } = useAuth();
  const trials = useSelector(selectTrials);
  const xp = useSelector(selectXP);
  const weeklyXP = useSelector(selectWeeklyXP);
  const streak = useSelector(selectStreak);

  const period = useMemo(() => getWrappedPeriod(), []);
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    if (!period || !user?.id) return;
    let cancelled = false;
    const { start, end } = getPeriodRange(period);
    getStudyLogs(user.id, { from: start, to: end })
      .then((data) => { if (!cancelled) setLogs(data || []); })
      .catch(() => { if (!cancelled) setLogs([]); });
    return () => { cancelled = true; };
  }, [period, user?.id]);

  const stats = useMemo(() => {
    if (!logs) return null;
    const xpVal = period === "weekly" ? weeklyXP : xp;
    return computeWrapped(logs, trials, streak, xpVal);
  }, [logs, trials, streak, xp, weeklyXP, period]);

  return { period, stats };
}
