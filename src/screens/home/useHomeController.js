import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

import { useAuth } from "../../contexts/AuthContext";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { useNetwork } from "../../contexts/NetworkContext";
import { usePremium } from "../../contexts/PremiumContext";
import { useSync } from "../../contexts/DataSyncContext";
import {
  selectStreak, selectTodayLogs, selectFreezeCount, selectLongestStreak, selectFreezeResetAt, selectLastStudyDate,
} from "../../store/slices/studyLogSlice";
import { selectTrials } from "../../store/slices/trialSlice";
import { selectDailyQuestionsGoal } from "../../store/slices/goalsSlice";
import { usePlanContext } from "../../hooks/usePlanContext";
import { useRecommendations } from "../../hooks/useRecommendations";
import { useAISuggestions } from "../../hooks/useAISuggestions";
import { useNudgePopup } from "../../hooks/useNudgePopup";
import { useRetention } from "../../hooks/useRetention";
import { useGamification } from "../../hooks/useGamification";
import { useDailyGoalReward } from "../../hooks/useDailyGoalReward";
import { useCompletionMoments } from "../../hooks/useCompletionMoments";
import { useHomeDashboard } from "../../hooks/useHomeDashboard";
import { useTodayStops } from "../../hooks/useTodayStops";
import { buildRecentStudies } from "../../domain/study/recentStudies";
import { getSubjectByKey } from "../../themes/subjects";
import { useHomeGamificationBridge } from "./useHomeGamificationBridge";
import { useHomeNavigation } from "./useHomeNavigation";
import { useHomeRefresh } from "./useHomeRefresh";
import { useHomeActions } from "./useHomeActions";

const subjectLabel = (key) => getSubjectByKey(key)?.label;

// Ana Sayfa'nin tum durumu tek yerde; ekran dosyasi yalniz hal secer ve cizer.
export function useHomeController() {
  const navigation = useNavigation();
  const C = useC();
  const { user } = useAuth();
  const { daysUntilExam } = useExam();
  const { isConnected } = useNetwork();
  const { accessLoading, isInGrace } = usePremium();
  const gamification = useGamification();
  const { reward, syncStat, checkMilestone } = gamification;
  const { comeback, dismissComeback } = useRetention(reward);
  const dailyGoal = useSelector(selectDailyQuestionsGoal);
  const streak = useSelector(selectStreak);
  const freezeCount = useSelector(selectFreezeCount);
  const longestStreak = useSelector(selectLongestStreak);
  const freezeResetAt = useSelector(selectFreezeResetAt);
  const lastStudyDate = useSelector(selectLastStudyDate);
  const todayLogs = useSelector(selectTodayLogs);
  const trials = useSelector(selectTrials);

  useHomeGamificationBridge({ checkMilestone, streak, syncStat });

  const planCtx = usePlanContext();
  const nudges = useRecommendations(planCtx.weekLogs);
  const nudge = useNudgePopup(nudges);
  const { suggestions } = useAISuggestions();
  const { refresh } = useSync();
  const { onRefresh, refreshing } = useHomeRefresh(refresh);
  const go = useHomeNavigation(navigation);

  const dashboard = useHomeDashboard({ C, planCtx, todayLogs, trials, user });
  const { solvedToday, routeCurrentWeek, routeTotals, transitionStop, weekLogs, weekLoaded } = dashboard;
  const goalReward = useDailyGoalReward({ solvedToday, dailyGoal, userId: user?.id, reward });
  const completion = useCompletionMoments({ currentWeek: routeCurrentWeek, totals: routeTotals, userId: user?.id });
  const { markDayDone } = completion;

  const onAllDone = useCallback((items) => {
    reward("perfect_plan", { statUpdates: [{ type: "increment", key: "perfectPlans" }] });
    markDayDone(items);
  }, [reward, markDayDone]);
  const onRouteComplete = useCallback(
    (stop) => transitionStop(stop, "completed", { source: "home_plan" }),
    [transitionStop],
  );
  const stops = useTodayStops({
    generatedTasks: dashboard.generatedTasks,
    aiSuggestion: suggestions?.length ? suggestions[0] : null,
    onRouteComplete,
    onAllDone,
  });

  const recent = useMemo(() => buildRecentStudies(weekLogs, { subjectLabel }), [weekLogs]);
  const actions = useHomeActions({ navigation, go });

  const { showNext } = nudge;
  useEffect(() => { showNext(2000); }, [showNext]);

  // Iskelet yalniz ilk acilista: veri geldi, baglanti yok ya da 4 sn doldu.
  const readyRef = useRef(false);
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, []);
  if ((!accessLoading && weekLoaded) || !isConnected || timedOut) readyRef.current = true;
  const [offlineDismissed, setOfflineDismissed] = useState(false);
  const hasLocalData = todayLogs.length > 0 || trials.length > 0 || weekLogs.length > 0 || !!lastStudyDate;

  return {
    C, navigation, dailyGoal, daysUntilExam, comeback, dismissComeback, gamification, goalReward, completion,
    nudges, nudge, dashboard, stops, recent, actions, onRefresh, refreshing,
    streak, freezeCount, longestStreak, freezeResetAt, lastStudyDate, isInGrace,
    loading: !readyRef.current,
    firstDay: !hasLocalData && streak === 0,
    offline: !isConnected && !hasLocalData && !offlineDismissed,
    continueOffline: () => setOfflineDismissed(true),
  };
}
