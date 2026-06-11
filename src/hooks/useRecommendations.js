import { useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import { selectTrials } from "../store/slices/trialSlice";
import { selectTodayLogs, selectStreak } from "../store/slices/studyLogSlice";
import { generateNudges } from "../lib/smartNudge";

export function useRecommendations() {
  const trials = useAppSelector(selectTrials);
  const todayLogs = useAppSelector(selectTodayLogs);
  const streak = useAppSelector(selectStreak);

  const nudges = useMemo(() => {
    const recentStudy = {};
    todayLogs.forEach((l) => {
      if (l.subject && l.study_date) recentStudy[l.subject] = l.study_date;
    });

    const weakAreas = {};
    if (trials.length > 0) {
      const latest = trials[0];
      Object.entries(latest.subjects || {}).forEach(([key, s]) => {
        const total = (s.correct || 0) + (s.wrong || 0);
        weakAreas[key] = total > 0 ? Math.round(((s.correct || 0) / total) * 100) : 50;
      });
    }

    return generateNudges({ recentStudy, trials, streak, weakAreas });
  }, [trials, todayLogs, streak]);

  return nudges;
}
