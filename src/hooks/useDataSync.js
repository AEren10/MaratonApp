import { useEffect, useCallback, useState, useRef } from "react";
import { AppState } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useNetwork } from "../contexts/NetworkContext";
import { useAppDispatch } from "../store/hooks";
import { setTrials } from "../store/slices/trialSlice";
import { setTodayLogs, setStreak, setFreezeCount, setLongestStreak, setFreezeResetAt, setLastStudyDate } from "../store/slices/studyLogSlice";
import { setGoals } from "../store/slices/goalsSlice";
import { setUserTasks } from "../store/slices/userTasksSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadGamificationFromStorage } from "../store/slices/gamificationSlice";
import { updateStreak } from "../supabase/streaks";
import { getTrials } from "../supabase/trials";
import { getStudyLogsByDate } from "../supabase/studyLogs";
import { getStreak } from "../supabase/streaks";
import { getProfile } from "../supabase/profiles";
import { getUserTasksByDate } from "../supabase/userTasks";
import { flushQueue, getPendingStudyLogs } from "../lib/offlineQueue";

async function retryPendingStreak() {
  try {
    const raw = await AsyncStorage.getItem("@maraton:pending_streak");
    if (!raw) return;
    const { userId, updates } = JSON.parse(raw);
    await updateStreak(userId, updates);
    await AsyncStorage.removeItem("@maraton:pending_streak");
  } catch (_) {}
}

async function loadAll(userId, dispatch) {
  await loadGamificationFromStorage(dispatch);
  await retryPendingStreak();
  const flushed = await flushQueue().catch(() => ({ processed: 0, types: [] }));

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
    dispatch(setLongestStreak(streak.value.longest_streak || 0));
    dispatch(setFreezeResetAt(streak.value.freeze_reset_at || null));
    dispatch(setLastStudyDate(streak.value.last_study_date || null));
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
    const g = { dailyQuestions: profile.value.daily_question_goal };
    if (profile.value.weekly_trials_goal != null) g.weeklyTrials = profile.value.weekly_trials_goal;
    if (profile.value.weekly_minutes_goal != null) g.weeklyMinutes = profile.value.weekly_minutes_goal;
    dispatch(setGoals(g));
  }
}

export function useDataSync() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { isConnected } = useNetwork();
  const [syncing, setSyncing] = useState(false);
  const wasOfflineRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const safeDispatch = useCallback(
    (action) => { if (mountedRef.current) dispatch(action); },
    [dispatch],
  );

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    let cancelled = false;
    setSyncing(true);
    loadAll(user.id, safeDispatch)
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => { cancelled = true; };
  }, [user?.id, safeDispatch]);

  const appStateRef = useRef(AppState.currentState);
  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    const sub = AppState.addEventListener("change", (next) => {
      if (appStateRef.current.match(/inactive|background/) && next === "active") {
        flushQueue()
          .then((r) => { if (r.processed > 0) loadAll(user.id, safeDispatch).catch(() => {}); })
          .catch(() => {});
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [user?.id, safeDispatch]);

  // Network reconnection sync
  useEffect(() => {
    if (!isConnected) {
      wasOfflineRef.current = true;
      return;
    }
    if (wasOfflineRef.current && user?.id && user.id !== "dev") {
      wasOfflineRef.current = false;
      flushQueue()
        .then(() => loadAll(user.id, safeDispatch).catch(() => {}))
        .catch(() => {});
    }
  }, [isConnected, user?.id, safeDispatch]);

  const refresh = useCallback(async () => {
    if (!user?.id || user.id === "dev") return;
    setSyncing(true);
    try {
      await loadAll(user.id, safeDispatch);
    } finally {
      if (mountedRef.current) setSyncing(false);
    }
  }, [user?.id, safeDispatch]);

  return { syncing, refresh };
}
