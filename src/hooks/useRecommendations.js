import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAppSelector } from "../store/hooks";
import { selectTrials } from "../store/slices/trialSlice";
import { selectTodayLogs, selectStreak } from "../store/slices/studyLogSlice";
import { selectDailyQuestionsGoal } from "../store/slices/goalsSlice";
import { generateNudges } from "../lib/smartNudge";
import { buildRecentStudy } from "../lib/buildPlanContext";
import { dateKey } from "../lib/dateUtils";
import { getStudyLogs } from "../supabase/studyLogs";
import { trialSubjectsToCurriculumWeakAreas } from "../domain/trial/trialKeyMap";

const LOG_WINDOW_DAYS = 45;

function historyWindow() {
  const to = new Date();
  const from = new Date(Date.now() - LOG_WINDOW_DAYS * 86400000);
  return { from: dateKey(from), to: dateKey(to) };
}

export function useRecommendations(historyLogs = null) {
  const { user } = useAuth();
  const trials = useAppSelector(selectTrials);
  const todayLogs = useAppSelector(selectTodayLogs);
  const streak = useAppSelector(selectStreak);
  const dailyGoal = useAppSelector(selectDailyQuestionsGoal);
  const [fetchedLogs, setFetchedLogs] = useState([]);

  const hasProvidedHistory = Array.isArray(historyLogs);

  useEffect(() => {
    if (hasProvidedHistory) return undefined;
    if (!user?.id || user.id === "dev") {
      setFetchedLogs([]);
      return undefined;
    }

    let cancelled = false;
    const { from, to } = historyWindow();
    getStudyLogs(user.id, { from, to })
      .then((logs) => { if (!cancelled) setFetchedLogs(logs || []); })
      .catch(() => { if (!cancelled) setFetchedLogs([]); });

    return () => { cancelled = true; };
  }, [hasProvidedHistory, user?.id]);

  const nudges = useMemo(() => {
    let todayTotal = 0;
    todayLogs.forEach((l) => {
      todayTotal += l.questionCount ?? l.question_count ?? 0;
    });

    const sourceLogs = hasProvidedHistory ? historyLogs : fetchedLogs;
    const recentStudy = buildRecentStudy(sourceLogs?.length ? [...sourceLogs, ...todayLogs] : todayLogs);

    let weakAreas = {};
    if (trials.length > 0) {
      weakAreas = trialSubjectsToCurriculumWeakAreas(trials[0].subjects);
    }

    return generateNudges({ recentStudy, trials, streak, weakAreas, todayTotal, dailyGoal });
  }, [dailyGoal, fetchedLogs, hasProvidedHistory, historyLogs, streak, todayLogs, trials]);

  return nudges;
}
