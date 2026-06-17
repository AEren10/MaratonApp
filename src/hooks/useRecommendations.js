import { useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import { selectTrials } from "../store/slices/trialSlice";
import { selectTodayLogs, selectStreak } from "../store/slices/studyLogSlice";
import { selectDailyQuestionsGoal } from "../store/slices/goalsSlice";
import { generateNudges } from "../lib/smartNudge";
import { trialSubjectsToCurriculumWeakAreas } from "../screens/trial/trialKeyMap";

export function useRecommendations() {
  const trials = useAppSelector(selectTrials);
  const todayLogs = useAppSelector(selectTodayLogs);
  const streak = useAppSelector(selectStreak);
  const dailyGoal = useAppSelector(selectDailyQuestionsGoal);

  const nudges = useMemo(() => {
    const recentStudy = {};
    let todayTotal = 0;
    todayLogs.forEach((l) => {
      if (l.subject && l.study_date) recentStudy[l.subject] = l.study_date;
      todayTotal += l.question_count || 0;
    });

    let weakAreas = {};
    if (trials.length > 0) {
      weakAreas = trialSubjectsToCurriculumWeakAreas(trials[0].subjects);
    }

    return generateNudges({ recentStudy, trials, streak, weakAreas, todayTotal, dailyGoal });
  }, [trials, todayLogs, streak, dailyGoal]);

  return nudges;
}
