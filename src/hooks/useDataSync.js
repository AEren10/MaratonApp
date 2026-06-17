import { useEffect, useCallback, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAppDispatch } from "../store/hooks";
import { setTrials } from "../store/slices/trialSlice";
import { setTodayLogs, setStreak, setFreezeCount } from "../store/slices/studyLogSlice";
import { setGoals } from "../store/slices/goalsSlice";
import { setUserTasks } from "../store/slices/userTasksSlice";
import { getTrials } from "../supabase/trials";
import { getStudyLogsByDate } from "../supabase/studyLogs";
import { getStreak } from "../supabase/streaks";
import { getProfile } from "../supabase/profiles";
import { getUserTasksByDate } from "../supabase/userTasks";
import { flushQueue, getPendingStudyLogs } from "../lib/offlineQueue";

async function loadAll(userId, dispatch) {
  // Try to flush any pending offline operations first
  await flushQueue().catch(() => {});

  const todayDate = new Date().toISOString().split("T")[0];
  const [trials, streak, todayLogs, profile, userTasks] = await Promise.allSettled([
    getTrials(userId),
    getStreak(userId),
    getStudyLogsByDate(userId, todayDate),
    getProfile(userId),
    getUserTasksByDate(userId, todayDate),
  ]);

  if (trials.status === "fulfilled" && trials.value) {
    const mapped = trials.value.map((t) => {
      const subjects = {};
      (t.trial_subjects || []).forEach((s) => {
        subjects[s.subject] = {
          correct: s.correct_count,
          wrong: s.wrong_count,
          net: s.net,
        };
      });
      return {
        id: t.id,
        date: t.trial_date,
        totalNet: parseFloat(t.total_net) || 0,
        subjects,
        trialType: t.exam_type,
        field: t.field,
        branchSubject: t.branch_subject,
        name: t.name,
        mood: t.mood,
      };
    });
    dispatch(setTrials(mapped));
  }

  if (streak.status === "fulfilled" && streak.value) {
    dispatch(setStreak(streak.value.current_streak || 0));
    dispatch(setFreezeCount(streak.value.freeze_count ?? 1));
  }

  if (todayLogs.status === "fulfilled" && todayLogs.value) {
    const mapped = todayLogs.value.map((l) => ({
      id: l.id,
      subject: l.subject,
      topic: l.topic,
      questionCount: l.question_count,
      duration: l.duration_minutes,
      study_date: l.study_date,
    }));

    const todayStr = new Date().toISOString().split("T")[0];
    const pending = await getPendingStudyLogs().catch(() => []);
    const existingIds = new Set(mapped.map((m) => `${m.subject}_${m.topic}_${m.questionCount}`));
    const pendingToday = pending
      .filter((p) => p.study_date === todayStr)
      .filter((p) => !existingIds.has(`${p.subject}_${p.topic}_${p.question_count}`))
      .map((p, i) => ({
        id: `pending_${i}`,
        subject: p.subject,
        topic: p.topic,
        questionCount: p.question_count,
        duration: p.duration_minutes,
        study_date: p.study_date,
      }));

    dispatch(setTodayLogs([...mapped, ...pendingToday]));
  }

  if (userTasks.status === "fulfilled" && userTasks.value) {
    dispatch(setUserTasks(userTasks.value));
  }

  if (profile.status === "fulfilled" && profile.value?.daily_question_goal != null) {
    dispatch(setGoals({ dailyQuestions: profile.value.daily_question_goal }));
  }
}

export function useDataSync() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    let cancelled = false;
    setSyncing(true);
    loadAll(user.id, dispatch)
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => { cancelled = true; };
  }, [user?.id, dispatch]);

  const refresh = useCallback(async () => {
    if (!user?.id || user.id === "dev") return;
    setSyncing(true);
    try {
      await loadAll(user.id, dispatch);
    } finally {
      setSyncing(false);
    }
  }, [user?.id, dispatch]);

  return { syncing, refresh };
}
