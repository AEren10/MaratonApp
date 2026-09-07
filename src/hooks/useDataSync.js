import { useEffect, useCallback, useState, useRef } from "react";
import { AppState } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useNetwork } from "../contexts/NetworkContext";
import { useAppDispatch } from "../store/hooks";
import { setTrials } from "../store/slices/trialSlice";
import { setTodayLogs, setStreak, setFreezeCount, setLongestStreak, setFreezeResetAt, setLastStudyDate } from "../store/slices/studyLogSlice";
import { setGoals, saveGoalsToStorage } from "../store/slices/goalsSlice";
import { setUserTasks } from "../store/slices/userTasksSlice";
import { loadGamificationFromStorage, hydrateGamification, setRetentionData, setMaxStat } from "../store/slices/gamificationSlice";
import { getXPTotals } from "../supabase/xp";
import { touchStreak } from "../supabase/streaks";
import { getTrials } from "../supabase/trials";
import { getStudyLogsByDate } from "../supabase/studyLogs";
import { todayTR } from "../lib/dateUtils";
import { getStreak } from "../supabase/streaks";
import { getProfile, updateLastActive } from "../supabase/profiles";
import { getUserTasksByDate } from "../supabase/userTasks";
import { flushQueue, getPendingStudyLogs, getPendingTrials } from "../lib/offlineQueue";
import { getExpoPushToken, loadNotifPrefsFromServer, applyNotifPrefs, getNotifPrefs } from "../lib/notifications";
import { registerPushToken } from "../supabase/profiles";
import { getSession } from "../supabase/auth";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { normalizeStudyLog } from "../domain/study/studyLogModel";
import { normalizeTrial } from "../domain/trial/trialModel";
import { getJson, remove } from "../lib/storage/appStorage";

async function retryPendingStreak(activeUserId) {
  try {
    const pending = await getJson(STORAGE_KEYS.PENDING_STREAK);
    if (!pending) return;
    const { userId, studyDate } = pending;
    if (userId !== activeUserId) return;
    await touchStreak(userId, studyDate || null);
    await remove(STORAGE_KEYS.PENDING_STREAK);
  } catch (_) {}
}

async function loadAll(userId, dispatch) {
  await loadGamificationFromStorage(dispatch);
  await retryPendingStreak(userId);
  await flushQueue().catch(() => ({ processed: 0, types: [] }));

  const todayDate = todayTR();
  const [trials, streak, todayLogs, profile, userTasks, xpTotals] = await Promise.allSettled([
    getTrials(userId),
    getStreak(userId),
    getStudyLogsByDate(userId, todayDate),
    getProfile(userId),
    getUserTasksByDate(userId, todayDate),
    getXPTotals(userId),
  ]);

  if (trials.status === "fulfilled" && trials.value) {
    const server = trials.value.map(normalizeTrial);
    // Kuyrukta bekleyen denemeler de listede görünmeli. Görünmedikleri için
    // çevrimdışı girilen deneme, ilk tazelemede kaybolmuş gibi oluyordu.
    const queued = await getPendingTrials(userId).catch(() => []);
    const seen = new Set(server.map((t) => t.client_operation_id).filter(Boolean));
    const pendingTrials = queued
      .filter((t) => !t.client_operation_id || !seen.has(t.client_operation_id))
      .map(normalizeTrial);
    dispatch(setTrials([...server, ...pendingTrials]));
  }

  if (streak.status === "fulfilled" && streak.value) {
    const streakVal = streak.value.current_streak || 0;
    dispatch(setStreak(streakVal));
    dispatch(setFreezeCount(streak.value.freeze_count ?? 0));
    dispatch(setLongestStreak(streak.value.longest_streak || 0));
    dispatch(setFreezeResetAt(streak.value.freeze_reset_at || null));
    dispatch(setLastStudyDate(streak.value.last_study_date || null));
    dispatch(setMaxStat({ key: "streak", value: streakVal }));
  }

  let studiedToday = false;

  if (todayLogs.status === "fulfilled" && todayLogs.value) {
    const mapped = todayLogs.value.map(normalizeStudyLog);

    const todayStr = todayDate;
    const pending = await getPendingStudyLogs(userId).catch(() => []);
    const existingIds = new Set(mapped.map((m) => `${m.subject}_${m.topic}_${m.questionCount}_${m.correctCount}_${m.duration}`));
    const pendingToday = pending
      .filter((p) => p.study_date === todayStr)
      .map(normalizeStudyLog)
      .filter((p) => !existingIds.has(`${p.subject}_${p.topic}_${p.questionCount}_${p.correctCount}_${p.duration}`))
      .map((p, i) => ({
        ...p,
        id: `pending_${i}`,
      }));

    studiedToday = mapped.length + pendingToday.length > 0;
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
    saveGoalsToStorage(g);
  } else {
    const localGoals = await getJson(STORAGE_KEYS.GOALS);
    if (localGoals) dispatch(setGoals(localGoals));
  }

  const xpFromServer = xpTotals.status === "fulfilled" ? xpTotals.value.total : 0;
  const weeklyFromServer = xpTotals.status === "fulfilled" ? xpTotals.value.weekly : 0;
  const serverStats = profile.status === "fulfilled" ? profile.value?.gamification_stats : null;

  if (xpFromServer > 0 || serverStats) {
    const patch = { xp: xpFromServer, weeklyXP: weeklyFromServer };
    if (serverStats && typeof serverStats === "object") {
      const { claimedMilestones: cm, ...pureStats } = serverStats;
      patch.stats = pureStats;
      if (Array.isArray(cm) && cm.length > 0) patch.claimedMilestones = cm;
    }
    dispatch(hydrateGamification(patch));
  }

  if (profile.status === "fulfilled" && profile.value) {
    dispatch(setRetentionData({
      studySessionCount: profile.value.study_session_count || 0,
      loginRewardedDate: profile.value.login_rewarded_date || null,
      reviewLastAsked: profile.value.review_last_asked || null,
      lastActive: profile.value.last_active || null,
    }));
  }

  getExpoPushToken().then((token) => {
    if (token) registerPushToken(userId, token);
  }).catch(() => {});

  // studiedToday: seri-riski bildirimi bugün çalışmış kullanıcıya gitmesin.
  const streakToday = streak.status === "fulfilled" ? (streak.value?.current_streak || 0) : 0;
  loadNotifPrefsFromServer(userId).then(async (serverPrefs) => {
    const prefs = serverPrefs || await getNotifPrefs();
    applyNotifPrefs(prefs, { streak: streakToday, studiedToday });
  }).catch(() => {});

  updateLastActive(userId);
}

export function useDataSync() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { isConnected } = useNetwork();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const wasOfflineRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  // Çıkış→giriş sırasında uçuşta kalan istekler RESET_STORE'dan SONRA
  // dönebiliyor. Sadece mountedRef'e bakmak yetmez: eski kullanıcının
  // denemeleri/çalışma logları yeni kullanıcının store'una düşer.
  const activeUserIdRef = useRef(null);
  activeUserIdRef.current = user?.id ?? null;

  const safeDispatch = useCallback(
    (action, ownerId) => {
      if (!mountedRef.current) return;
      if (ownerId && activeUserIdRef.current !== ownerId) return;
      dispatch(action);
    },
    [dispatch],
  );

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    const ownerId = user.id;
    let cancelled = false;
    setSyncing(true);
    loadAll(ownerId, (action) => safeDispatch(action, ownerId))
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => { cancelled = true; };
  }, [user?.id, safeDispatch]);

  const appStateRef = useRef(AppState.currentState);
  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    const sub = AppState.addEventListener("change", async (next) => {
      if (appStateRef.current.match(/inactive|background/) && next === "active") {
        try {
          const session = await getSession();
          if (!session) return;
        } catch { return; }
        flushQueue()
          .then((r) => { if (r.processed > 0) loadAll(user.id, (a) => safeDispatch(a, user.id)).catch(() => {}); })
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
        .then(() => loadAll(user.id, (a) => safeDispatch(a, user.id)).catch(() => {}))
        .catch(() => {});
    }
  }, [isConnected, user?.id, safeDispatch]);

  const refresh = useCallback(async () => {
    if (!user?.id || user.id === "dev") return;
    setSyncing(true);
    try {
      await loadAll(user.id, (a) => safeDispatch(a, user.id));
    } catch (e) {
      if (mountedRef.current) setError(e);
    } finally {
      if (mountedRef.current) setSyncing(false);
    }
  }, [user?.id, safeDispatch]);

  return { syncing, refresh, error };
}
