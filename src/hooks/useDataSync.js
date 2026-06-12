import { useEffect, useCallback, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAppDispatch } from "../store/hooks";
import { setTrials } from "../store/slices/trialSlice";
import { setTodayLogs, setStreak, setFreezeCount } from "../store/slices/studyLogSlice";
import { getTrials } from "../supabase/trials";
import { getStudyLogsByDate } from "../supabase/studyLogs";
import { getStreak } from "../supabase/streaks";
import { flushQueue } from "../lib/offlineQueue";

async function loadAll(userId, dispatch) {
  // Try to flush any pending offline operations first
  await flushQueue().catch(() => {});

  const [trials, streak, todayLogs] = await Promise.allSettled([
    getTrials(userId),
    getStreak(userId),
    getStudyLogsByDate(userId, new Date().toISOString().split("T")[0]),
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
    dispatch(setTodayLogs(mapped));
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
    loadAll(user.id, dispatch).finally(() => {
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
