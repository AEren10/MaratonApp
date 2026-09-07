import React, { useState, useEffect, useMemo } from "react";
import { ScrollView, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useAuth } from "../../contexts/AuthContext";
import { selectStreak, selectTodayLogs, selectFreezeCount, selectLongestStreak, selectFreezeResetAt, selectLastStudyDate } from "../../store/slices/studyLogSlice";
import { selectTrials } from "../../store/slices/trialSlice";
import { selectXP, selectWeeklyXP } from "../../store/slices/gamificationSlice";
import { selectDailyQuestionsGoal } from "../../store/slices/goalsSlice";
import { usePlanContext } from "../../hooks/usePlanContext";
import { SPACING } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { SyncProblemBanner } from "../../components/common/SyncProblemBanner";
import { AnimatedCard } from "../../components/design/AnimatedCard";
import { GlowBackground, WARM_GLOW } from "../../components/design";

import { useRecommendations } from "../../hooks/useRecommendations";
import { useWeeklyReport } from "../../hooks/useWeeklyReport";
import { useWeeklyTrialReport } from "../../hooks/useWeeklyTrialReport";
import { useAISuggestions } from "../../hooks/useAISuggestions";
import { useSync } from "../../contexts/DataSyncContext";
import { useNudgePopup } from "../../hooks/useNudgePopup";
import { useRetention } from "../../hooks/useRetention";
import { useGamification } from "../../hooks/useGamification";
import { usePremium } from "../../contexts/PremiumContext";
import { useDailyGoalReward } from "../../hooks/useDailyGoalReward";
import { useHomeDashboard } from "../../hooks/useHomeDashboard";
import { HomeHeader } from "./components/HomeHeader";
import { HomeHero } from "./components/HomeHero";
import { HomeCoachNudge } from "./components/HomeCoachNudge";
import { HomeOverlays } from "./components/HomeOverlays";
import { HomePlanSection } from "./components/HomePlanSection";
import { HomeQuickActionsSection } from "./components/HomeQuickActionsSection";
import { ExamCountdown } from "./components/ExamCountdown";
import { HomeWeeklySection } from "./components/HomeWeeklySection";
import SubjectMomentum from "./components/SubjectMomentum";
import { WeeklyActivityCard } from "./components/WeeklyActivityCard";
import { useWrapped } from "../../hooks/useWrapped";
import { trackButtonTap } from "../../lib/analytics";
import { createHomeQuickActions } from "./homeActions";
import { useHomeGamificationBridge } from "./useHomeGamificationBridge";
import { useHomeNavigation } from "./useHomeNavigation";
import { useHomeRefresh } from "./useHomeRefresh";
import { useExam } from "../../contexts/ExamContext";


function HomeSkeleton() {
  return (
    <View style={{ paddingHorizontal: SPACING.lg, paddingTop: 60, gap: SPACING.md }}>
      <SkeletonCard height={24} width={160} rounded={SPACING.sm} />
      <SkeletonCard height={160} />
      <View style={{ flexDirection: "row", gap: SPACING.md }}>
        <SkeletonCard height={110} width="48%" />
        <SkeletonCard height={110} width="48%" />
      </View>
      <View style={{ flexDirection: "row", gap: SPACING.md }}>
        <SkeletonCard height={110} width="48%" />
        <SkeletonCard height={110} width="48%" />
      </View>
      <SkeletonCard height={64} />
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const C = useC();
  const { user } = useAuth();
  const { examType } = useExam();
  const {
    reward, syncStat, checkMilestone,
    xpToast, dismissXP,
    levelUpModal, dismissLevelUp,
    milestoneModal, dismissMilestone,
  } = useGamification();
  const { checkFeature, showPaywall } = usePremium();
  const { comeback, dismissComeback } = useRetention(reward);
  const dailyGoal = useSelector(selectDailyQuestionsGoal);

  const quickActions = useMemo(() => createHomeQuickActions(C, examType), [C, examType]);
  const streak = useSelector(selectStreak);
  const freezeCount = useSelector(selectFreezeCount);
  const longestStreak = useSelector(selectLongestStreak);
  const freezeResetAt = useSelector(selectFreezeResetAt);
  const lastStudyDate = useSelector(selectLastStudyDate);
  const todayLogs = useSelector(selectTodayLogs);
  const [streakSheetVisible, setStreakSheetVisible] = useState(false);
  const trials = useSelector(selectTrials);
  const xp = useSelector(selectXP);
  const weeklyXP = useSelector(selectWeeklyXP);

  useHomeGamificationBridge({ checkMilestone, streak, syncStat });

  const planCtx = usePlanContext();
  const nudges = useRecommendations();
  const { popup: nudgePopup, showNext: showNudgePopup, dismiss: dismissNudgePopup } = useNudgePopup(nudges);
  const weeklyReport = useWeeklyReport();
  const weeklyTrialReport = useWeeklyTrialReport();
  const { suggestions: aiSuggestions } = useAISuggestions();
  const { refresh } = useSync();
  const [nudgeVisible, setNudgeVisible] = useState(false);

  const dailyAction = aiSuggestions && aiSuggestions.length ? aiSuggestions[0] : null;
  const { period: wrappedPeriod, stats: wrappedStats } = useWrapped();

  const go = useHomeNavigation(navigation);
  const [loading, setLoading] = useState(true);
  const { onRefresh, refreshing } = useHomeRefresh(refresh);

  const dashboard = useHomeDashboard({
    C,
    planCtx,
    todayLogs,
    trials,
    user,
    weeklyXP,
  });
  const {
    displayName,
    generatedTasks,
    latestTrial,
    leagueTier,
    minutesToday,
    plan,
    solvedToday,
    subjectMomentum,
    weeklyActivity,
  } = dashboard;
  const { dismissGoalComplete, goalCompleteVisible } = useDailyGoalReward({
    solvedToday,
    dailyGoal,
    userId: user?.id,
    reward,
  });

  useEffect(() => {
    setLoading(false);
    showNudgePopup(2000);
  }, [showNudgePopup]);

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <GlowBackground blobs={WARM_GLOW} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />}
      >
        <HomeHeader
          name={displayName}
          streak={streak}
          freezeCount={freezeCount}
          lastStudyDate={lastStudyDate}
          onProfilePress={go(SCREENS.PROFILE)}
          onStreakPress={() => setStreakSheetVisible(true)}
          onCalendarPress={go(SCREENS.CALENDAR)}
        />

        <SyncProblemBanner />

        <View style={{ marginTop: SPACING.lg }}>
          <ExamCountdown onPress={go(SCREENS.GOALS)} />
        </View>

        <HomeCoachNudge
          C={C}
          nudge={nudges[0]}
          onPress={() => {
            const target = nudges[0].subject ? SCREENS.ANALYSIS : SCREENS.PLAN_DETAIL;
            trackButtonTap("home_coach_nudge", { targetScreen: target });
            navigation.navigate(target);
          }}
        />

        <View style={{ marginTop: 22 }}>
          <HomeHero
            solved={solvedToday}
            goal={dailyGoal}
            minutes={minutesToday}
            streak={streak}
            net={latestTrial.net}
            trend={latestTrial.trend}
            xp={xp}
            tier={leagueTier}
            onRingPress={go(SCREENS.ADD_STUDY)}
            onStreak={go(SCREENS.CALENDAR)}
            onNet={go(SCREENS.ANALYSIS)}
            onLeague={go(SCREENS.LEAGUE)}
          />
        </View>

        <HomePlanSection
          C={C}
          dailyAction={dailyAction}
          generatedTasks={generatedTasks}
          onAddTask={go(SCREENS.ADD_TASK)}
          onAllDone={() => reward("perfect_plan", {
            statUpdates: [{ type: "increment", key: "perfectPlans" }],
          })}
          onReview={go(SCREENS.REVIEW_SESSION)}
          onStartTask={(task) => {
            trackButtonTap("home_plan_task_start", {
              subject: task.subject,
              targetScreen: SCREENS.STUDY_TIMER,
            });
            navigation.navigate(SCREENS.STUDY_TIMER, { subjectKey: task.subject });
          }}
          onViewPlan={go(SCREENS.PLAN_DETAIL)}
          plan={plan}
          srDue={planCtx.srDue}
        />

        {subjectMomentum.length > 0 && (
          <AnimatedCard delay={120}>
            <View style={{ marginTop: SPACING.md }}>
              <SubjectMomentum subjects={subjectMomentum} />
            </View>
          </AnimatedCard>
        )}

        {weeklyActivity.total > 0 && (
          <AnimatedCard delay={140}>
            <View style={{ marginTop: SPACING.md }}>
              <WeeklyActivityCard
                totalQuestions={weeklyActivity.total}
                percentChange={weeklyActivity.percent}
                dailyCounts={weeklyActivity.counts}
                onPress={go(SCREENS.ANALYSIS)}
              />
            </View>
          </AnimatedCard>
        )}

        <HomeQuickActionsSection
          actions={quickActions}
          checkFeature={checkFeature}
          navigation={navigation}
          showPaywall={showPaywall}
        />

        <HomeWeeklySection
          onWeeklyReview={go(SCREENS.WEEKLY_REVIEW)}
          onWeeklyTrialReview={go(SCREENS.WEEKLY_TRIAL_REVIEW)}
          weeklyReport={weeklyReport}
          weeklyTrialReport={weeklyTrialReport}
          wrappedPeriod={wrappedPeriod}
          wrappedStats={wrappedStats}
        />
      </ScrollView>

      <HomeOverlays
        comeback={comeback}
        dailyGoal={dailyGoal}
        dismissComeback={dismissComeback}
        dismissGoalComplete={dismissGoalComplete}
        dismissLevelUp={dismissLevelUp}
        dismissMilestone={dismissMilestone}
        dismissNudgePopup={dismissNudgePopup}
        dismissXP={dismissXP}
        freezeCount={freezeCount}
        freezeResetAt={freezeResetAt}
        goalCompleteVisible={goalCompleteVisible}
        lastStudyDate={lastStudyDate}
        levelUpModal={levelUpModal}
        longestStreak={longestStreak}
        milestoneModal={milestoneModal}
        navigation={navigation}
        nudgePopup={nudgePopup}
        nudgeVisible={nudgeVisible}
        nudges={nudges}
        onCloseNudgeModal={() => setNudgeVisible(false)}
        onCloseStreakSheet={() => setStreakSheetVisible(false)}
        solvedToday={solvedToday}
        streak={streak}
        streakSheetVisible={streakSheetVisible}
        xpToast={xpToast}
      />
    </SafeAreaView>
  );
}
