import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { ScrollView, View, Text, Pressable, RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useAuth } from "../../contexts/AuthContext";
import { selectStreak, selectTodayLogs, selectFreezeCount, selectLongestStreak, selectFreezeResetAt, selectLastStudyDate } from "../../store/slices/studyLogSlice";
import { selectTrials } from "../../store/slices/trialSlice";
import { selectXP } from "../../store/slices/gamificationSlice";
import { selectDailyQuestionsGoal } from "../../store/slices/goalsSlice";
import { generateDailyPlan } from "../../lib/planEngine";
import { usePlanContext } from "../../hooks/usePlanContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { AnimatedCard } from "../../components/design/AnimatedCard";
import { Icon, IconBox, GlassCard } from "../../components/design";

import { useRecommendations } from "../../hooks/useRecommendations";
import { useWeeklyReport } from "../../hooks/useWeeklyReport";
import { useWeeklyTrialReport } from "../../hooks/useWeeklyTrialReport";
import { useAISuggestions } from "../../hooks/useAISuggestions";
import { useSync } from "../../contexts/DataSyncContext";
import { NudgeModal } from "../../components/common/NudgeModal";
import { NudgePopup } from "../../components/common/NudgePopup";
import { ComebackModal } from "../../components/common/ComebackModal";
import { LevelUpModal } from "../../components/common/LevelUpModal";
import { GoalCompleteModal } from "../../components/common/GoalCompleteModal";
import { useNudgePopup } from "../../hooks/useNudgePopup";
import { useRetention } from "../../hooks/useRetention";
import { useGamification } from "../../hooks/useGamification";
import { usePremium } from "../../contexts/PremiumContext";
import { XPBoostToast } from "../../components/common/XPBoostToast";
import StreakMilestoneModal from "../../components/common/StreakMilestoneModal";
import { trackStudyHour } from "../../lib/notificationTemplates";
import { GlowBackground, WARM_GLOW, SectionLabel } from "../../components/design";
import { HomeHeader } from "./components/HomeHeader";
import { HomeHero } from "./components/HomeHero";
import { TodayPlanCard } from "./components/TodayPlanCard";
import { RoundActions } from "./components/RoundActions";
import { WeeklyReportCard } from "./components/WeeklyReportCard";
import { WeeklyTrialCard } from "./components/WeeklyTrialCard";
import { ExamCountdown } from "./components/ExamCountdown";
import { StreakDetailSheet } from "../../components/common/StreakDetailSheet";
import { WrappedBanner } from "./components/WrappedBanner";
import SubjectMomentum from "./components/SubjectMomentum";
import { WeeklyActivityCard } from "./components/WeeklyActivityCard";
import { useWrapped } from "../../hooks/useWrapped";
import { getAllSubjects } from "../trial/trialTypes";
import { getStudyLogs } from "../../supabase/studyLogs";
import * as H from "../../lib/haptics";


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
  const {
    reward, syncStat, checkMilestone,
    xpToast, dismissXP,
    levelUpModal, dismissLevelUp,
    milestoneModal, dismissMilestone,
  } = useGamification();
  const { checkFeature, showPaywall } = usePremium();
  const { comeback, dismissComeback } = useRetention(reward);
  const dailyGoal = useSelector(selectDailyQuestionsGoal);

  const QUICK_PRIMARY = useMemo(() => [
    { icon: "play",     label: "Çalış",       go: SCREENS.STUDY_TIMER,    color: C.accent },
    { icon: "chart",    label: "Deneme",      go: SCREENS.TRIAL_ENTRY,    color: C.blue },
    { icon: "camera",   label: "Yanlış Ekle", go: SCREENS.ADD_WRONG,      color: C.coral },
    { icon: "notebook", label: "Defterim",    go: SCREENS.WRONG_NOTEBOOK, color: C.teal },
  ], [C]);
  const QUICK_SECONDARY = useMemo(() => [
    { icon: "target",   label: "5dk Quiz",    go: SCREENS.QUICK_PRACTICE, color: C.teal },
    { icon: "clock",    label: "Simülasyon",  go: SCREENS.EXAM_SIMULATOR, color: C.amber },
    { icon: "users",    label: "Challenge",   go: SCREENS.CHALLENGE,      color: C.pink },
    { icon: "trophy",   label: "Sıralama",    go: SCREENS.LEAGUE,         color: C.amber },
  ], [C]);
  const streak = useSelector(selectStreak);
  const freezeCount = useSelector(selectFreezeCount);
  const longestStreak = useSelector(selectLongestStreak);
  const freezeResetAt = useSelector(selectFreezeResetAt);
  const lastStudyDate = useSelector(selectLastStudyDate);
  const todayLogs = useSelector(selectTodayLogs);
  const [streakSheetVisible, setStreakSheetVisible] = useState(false);
  const trials = useSelector(selectTrials);
  const xp = useSelector(selectXP);

  useEffect(() => {
    if (streak > 0) syncStat("streak", streak);
  }, [streak, syncStat]);

  useEffect(() => {
    if (streak > 0) checkMilestone(streak);
  }, [streak, checkMilestone]);

  const trackedHourRef = useRef(false);
  useEffect(() => {
    if (solvedToday > 0 && !trackedHourRef.current) {
      trackedHourRef.current = true;
      trackStudyHour();
    }
  }, [solvedToday]);

  const planCtx = usePlanContext();
  const nudges = useRecommendations();
  const { popup: nudgePopup, showNext: showNudgePopup, dismiss: dismissNudgePopup } = useNudgePopup(nudges);
  const weeklyReport = useWeeklyReport();
  const weeklyTrialReport = useWeeklyTrialReport();
  const { suggestions: aiSuggestions } = useAISuggestions();
  const { refresh } = useSync();
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [goalCompleteVisible, setGoalCompleteVisible] = useState(false);

  const dailyAction = aiSuggestions && aiSuggestions.length ? aiSuggestions[0] : null;
  const { period: wrappedPeriod, stats: wrappedStats } = useWrapped();

  const navRef = useRef(navigation);
  const goCache = useRef({});
  if (navRef.current !== navigation) {
    navRef.current = navigation;
    goCache.current = {};
  }
  const go = useCallback((route) => {
    if (!goCache.current[route]) goCache.current[route] = () => navRef.current.navigate(route);
    return goCache.current[route];
  }, []);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Öğrenci";

  const solvedToday = useMemo(
    () => todayLogs.reduce((s, l) => s + (l.questionCount || 0), 0),
    [todayLogs]
  );
  const minutesToday = useMemo(
    () => todayLogs.reduce((s, l) => s + (l.duration || 0), 0),
    [todayLogs]
  );

  // Hedef ilk kez aşıldığında günde bir kez XP ödülü ver.
  // Ref date-keyed; geceyarısı geçince yeni gün için sıfırlanır.
  const goalRewarded = useRef({ date: null, fired: false });
  const goalTimerRef = useRef(null);
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (goalRewarded.current.date !== today) {
      goalRewarded.current = { date: today, fired: false };
    }
    const goal = dailyGoal > 0 ? dailyGoal : 100;
    if (solvedToday < goal || goalRewarded.current.fired) return;
    const todayKey = `@daily_goal_done_${today}`;
    AsyncStorage.getItem(todayKey).then((done) => {
      if (done || goalRewarded.current.fired) return;
      goalRewarded.current.fired = true;
      AsyncStorage.setItem(todayKey, "1");
      reward("daily_goal_complete");
      goalTimerRef.current = setTimeout(() => setGoalCompleteVisible(true), 1500);
    });
    return () => { if (goalTimerRef.current) clearTimeout(goalTimerRef.current); };
  }, [solvedToday, dailyGoal, reward]);

  const { plan, generatedTasks } = useMemo(() => {
    const generated = generateDailyPlan(planCtx);
    const totalQ = todayLogs.reduce((s, l) => s + (l.questionCount || 0), 0);
    const estHours = generated.estimatedMinutes >= 60
      ? `~${Math.round(generated.estimatedMinutes / 60)} saat`
      : `~${generated.estimatedMinutes} dk`;
    return {
      plan: { total: generated.totalQuestions, done: totalQ, dersler: generated.tasks.length, hours: estHours },
      generatedTasks: generated.tasks,
    };
  }, [todayLogs, planCtx]);

  const subjectMomentum = useMemo(() => {
    if (trials.length < 2) return [];
    const allSubj = getAllSubjects(C);
    const bySubj = {};
    trials.slice(0, 5).reverse().forEach((t) => {
      Object.entries(t.subjects || {}).forEach(([key, s]) => {
        if (!bySubj[key]) bySubj[key] = [];
        bySubj[key].push(s.net || 0);
      });
    });
    return Object.entries(bySubj)
      .filter(([, nets]) => nets.length >= 2)
      .slice(0, 4)
      .map(([key, nets]) => {
        const subj = allSubj.find((x) => x.key === key);
        const current = nets[nets.length - 1];
        const prev = nets[nets.length - 2];
        return {
          name: subj?.label || key,
          color: subj?.color || C.accent,
          nets,
          currentNet: current,
          delta: current - prev,
        };
      });
  }, [trials, C]);

  const [weeklyActivity, setWeeklyActivity] = useState({ total: 0, counts: [0,0,0,0,0,0,0], percent: 0 });
  useEffect(() => {
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);
    const from = monday.toISOString().split("T")[0];
    const to = now.toISOString().split("T")[0];

    const counts = [0, 0, 0, 0, 0, 0, 0];
    todayLogs.forEach((l) => { counts[dayOfWeek] += l.questionCount || 0; });

    if (!user?.id || user.id === "dev") {
      const total = counts.reduce((a, b) => a + b, 0);
      setWeeklyActivity({ total, counts, percent: 0 });
      return;
    }

    let cancelled = false;
    getStudyLogs(user.id, { from, to }).then((logs) => {
      if (cancelled) return;
      const weekCounts = [0, 0, 0, 0, 0, 0, 0];
      (logs || []).forEach((l) => {
        const d = new Date(l.study_date);
        const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
        weekCounts[idx] += l.question_count || 0;
      });
      weekCounts[dayOfWeek] = Math.max(weekCounts[dayOfWeek], counts[dayOfWeek]);
      const total = weekCounts.reduce((a, b) => a + b, 0);
      setWeeklyActivity({ total, counts: weekCounts, percent: 0 });
    }).catch(() => {
      const total = counts.reduce((a, b) => a + b, 0);
      setWeeklyActivity({ total, counts, percent: 0 });
    });
    return () => { cancelled = true; };
  }, [user?.id, todayLogs]);

  const lastDeneme = useMemo(() => {
    if (!trials.length) return { net: 0, trend: 0, bars: [] };
    const latest = trials[0];
    // pair against same-type previous for fair trend
    const prev = trials.slice(1).find((t) => t.trialType === latest.trialType);
    const net = latest.totalNet || 0;
    const trend = prev ? net - (prev.totalNet || 0) : 0;
    const bars = Object.entries(latest.subjects || {}).slice(0, 4).map(([key, s]) => {
      const subj = getAllSubjects(C).find((x) => x.key === key);
      return {
        c: subj?.color || C.amber,
        v: Math.min(1, Math.max(0, (s.net || 0) / (subj?.max || 40))),
      };
    });
    return { net, trend, bars };
  }, [trials, C]);

  useEffect(() => {
    setLoading(false);
    showNudgePopup(2000);
  }, [showNudgePopup]);

  const onRefresh = useCallback(async () => {
    H.tap();
    setRefreshing(true);
    try {
      await refresh();
    } catch {
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

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

        <View style={{ marginTop: SPACING.lg }}>
          <ExamCountdown onPress={go(SCREENS.GOALS)} />
        </View>

        {nudges.length > 0 && nudges[0] ? (
          <Pressable
            onPress={() => {
              if (nudges[0].subject) navigation.navigate(SCREENS.ANALYSIS);
              else navigation.navigate(SCREENS.PLAN_DETAIL);
            }}
            style={({ pressed }) => ({
              flexDirection: "row", alignItems: "center", gap: 11,
              marginTop: 14, padding: 12, paddingHorizontal: 14,
              borderRadius: 15, borderWidth: 1,
              borderColor: C.border, backgroundColor: C.surface,
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: "rgba(139,92,246,0.16)", alignItems: "center", justifyContent: "center" }}>
              <Icon name="target" size={17} color={C.accent} />
            </View>
            <Text style={{ flex: 1, fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 18, color: C.sec }} numberOfLines={2}>
              <Text style={{ fontFamily: "Inter_700Bold", color: C.text }}>Koç: </Text>
              {nudges[0].message || nudges[0].title}
            </Text>
            <Icon name="arrowR" size={14} color={C.muted} />
          </Pressable>
        ) : null}

        <View style={{ marginTop: 22 }}>
          <HomeHero
            solved={solvedToday}
            goal={dailyGoal}
            minutes={minutesToday}
            streak={streak}
            net={lastDeneme.net}
            trend={lastDeneme.trend}
            xp={xp}
            tier={xp >= 10000 ? "Obsidyen" : xp >= 5000 ? "Elmas" : xp >= 2000 ? "Altın" : xp >= 500 ? "Gümüş" : "Bronz"}
            onRingPress={go(SCREENS.ADD_STUDY)}
            onStreak={go(SCREENS.CALENDAR)}
            onNet={go(SCREENS.ANALYSIS)}
            onLeague={go(SCREENS.LEAGUE)}
          />
        </View>

        <View style={{ marginTop: SPACING.xxl, gap: SPACING.sm }}>
          <AnimatedCard delay={40}>
            <TodayPlanCard
              generatedTasks={generatedTasks}
              aiSuggestion={dailyAction}
              planSummary={plan}
              onViewAll={go(SCREENS.PLAN_DETAIL)}
              onAddTask={go(SCREENS.ADD_TASK)}
              onStart={(task) => navigation.navigate(SCREENS.STUDY_TIMER, { subjectKey: task.subject })}
              onTaskDone={() => reward("plan_task_done")}
              onAllDone={() => reward("perfect_plan", {
                statUpdates: [{ type: "increment", key: "perfectPlans" }],
              })}
            />
          </AnimatedCard>

          {planCtx.srDue > 0 ? (
            <AnimatedCard delay={80}>
              <Pressable onPress={go(SCREENS.REVIEW_SESSION)} accessibilityRole="button" accessibilityLabel={`${planCtx.srDue} yanlışın tekrar zamanı geldi`} accessibilityHint="Tekrar oturumuna gider">
                <GlassCard radius={RADIUS.xxl} style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md, padding: SPACING.lg, backgroundColor: C.coral + "14", borderColor: C.coral + "28" }}>
                  <IconBox icon="refresh" color={C.coral} size={44} rounded={RADIUS.md} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPOGRAPHY.label, color: C.coral }}>BUGÜN TEKRAR</Text>
                    <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text, marginTop: 2 }}>
                      {planCtx.srDue} yanlışın tekrar zamanı geldi
                    </Text>
                  </View>
                  <Icon name="arrowR" size={18} color={C.coral} />
                </GlassCard>
              </Pressable>
            </AnimatedCard>
          ) : null}

        </View>

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

        <View style={{ marginTop: SPACING.xxl }}>
          <SectionLabel>HIZLI İŞLEM</SectionLabel>
          <RoundActions items={QUICK_PRIMARY} secondaryItems={QUICK_SECONDARY} onPress={(q) => {
            if (!q.go) return;
            if (q.go === SCREENS.EXAM_SIMULATOR && !checkFeature("exam_simulator")) { showPaywall(); return; }
            navigation.navigate(q.go);
          }} />
        </View>

        {(() => {
          const day = new Date().getDay();
          const showWeekly = day === 0 || day === 1 || day === 5 || day === 6;
          if (!showWeekly && !(wrappedStats && wrappedPeriod)) return null;
          return (
            <View style={{ marginTop: SPACING.xxl, gap: SPACING.sm }}>
              {showWeekly && (
                <>
                  <AnimatedCard delay={160}>
                    <WeeklyReportCard report={weeklyReport} onPress={go(SCREENS.WEEKLY_REVIEW)} />
                  </AnimatedCard>
                  <AnimatedCard delay={180}>
                    <WeeklyTrialCard report={weeklyTrialReport} onPress={go(SCREENS.WEEKLY_TRIAL_REVIEW)} />
                  </AnimatedCard>
                </>
              )}
              {wrappedStats && wrappedPeriod && (
                <AnimatedCard delay={220}>
                  <WrappedBanner stats={wrappedStats} period={wrappedPeriod} />
                </AnimatedCard>
              )}
            </View>
          );
        })()}
      </ScrollView>

      <XPBoostToast amount={xpToast.amount} visible={xpToast.visible} multiplier={xpToast.multiplier} onDismiss={dismissXP} />

      <ComebackModal
        visible={!!comeback}
        daysAway={comeback?.daysAway}
        xpBonus={comeback?.xpBonus || 50}
        onDismiss={dismissComeback}
      />

      <GoalCompleteModal
        visible={goalCompleteVisible}
        solved={solvedToday}
        goal={dailyGoal}
        xpEarned={40}
        onDismiss={() => setGoalCompleteVisible(false)}
        onShare={() => { setGoalCompleteVisible(false); navigation.navigate(SCREENS.SHARE_CARD); }}
      />

      <LevelUpModal
        visible={levelUpModal.visible}
        level={levelUpModal.level}
        title={levelUpModal.title}
        onClose={dismissLevelUp}
      />

      <NudgePopup
        nudge={nudgePopup}
        visible={!!nudgePopup}
        onDismiss={dismissNudgePopup}
        onAction={(n) => {
          dismissNudgePopup();
          if (n.subject) navigation.navigate(SCREENS.ANALYSIS);
          else navigation.navigate(SCREENS.PLAN_DETAIL);
        }}
      />

      <StreakDetailSheet
        visible={streakSheetVisible}
        onClose={() => setStreakSheetVisible(false)}
        streak={streak}
        longestStreak={longestStreak}
        freezeCount={freezeCount}
        freezeResetAt={freezeResetAt}
        lastStudyDate={lastStudyDate}
      />

      <StreakMilestoneModal
        visible={milestoneModal.visible}
        milestone={milestoneModal.milestone}
        onDismiss={dismissMilestone}
      />

      <NudgeModal
        visible={nudgeVisible}
        nudges={nudges}
        onClose={() => setNudgeVisible(false)}
        onAction={(nudge) => {
          setNudgeVisible(false);
          if (nudge.actionLabel === "Plana Ekle" && nudge.subject) {
            navigation.navigate(SCREENS.ADD_TASK, { preSubject: nudge.subject });
          } else if (nudge.subject) {
            navigation.navigate(SCREENS.SUBJECT_DETAIL, { subjectKey: nudge.subject });
          } else {
            navigation.navigate(SCREENS.PLAN_DETAIL);
          }
        }}
      />
    </SafeAreaView>
  );
}
