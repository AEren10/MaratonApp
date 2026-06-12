import { useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import { selectTrials } from "../store/slices/trialSlice";
import { selectTodayLogs, selectStreak } from "../store/slices/studyLogSlice";
import { generateNudges } from "../lib/smartNudge";
import { trialSubjectsToCurriculumWeakAreas } from "../screens/trial/trialKeyMap";

export function useRecommendations() {
  const trials = useAppSelector(selectTrials);
  const todayLogs = useAppSelector(selectTodayLogs);
  const streak = useAppSelector(selectStreak);

  const nudges = useMemo(() => {
    const recentStudy = {};
    todayLogs.forEach((l) => {
      if (l.subject && l.study_date) recentStudy[l.subject] = l.study_date;
    });

    let weakAreas = {};
    if (trials.length > 0) {
      weakAreas = trialSubjectsToCurriculumWeakAreas(trials[0].subjects);
    }

    return generateNudges({ recentStudy, trials, streak, weakAreas });
  }, [trials, todayLogs, streak]);

  return nudges;
}
