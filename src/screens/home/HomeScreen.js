import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { ScrollView, View, Text, Pressable, RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useAuth } from "../../contexts/AuthContext";
import { selectStreak, selectTodayLogs, selectFreezeCount } from "../../store/slices/studyLogSlice";
import { selectTrials } from "../../store/slices/trialSlice";
import { selectXP } from "../../store/slices/gamificationSlice";
import { selectDailyQuestionsGoal } from "../../store/slices/goalsSlice";
import { generateDailyPlan } from "../../lib/planEngine";
import { usePlanContext } from "../../hooks/usePlanContext";
import { SPACING } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { AnimatedCard } from "../../components/design/AnimatedCard";
import { Icon } from "../../components/design";

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
import { getMotivMessage } from "../../lib/motivMessages";
import { useGamification } from "../../hooks/useGamification";
import { XPToast } from "../../components/common/XPToast";
import { GlowBackground, WARM_GLOW, GlassCard, SectionLabel } from "../../components/design";
import { HomeHeader } from "./components/HomeHeader";
import { HomeHero } from "./components/HomeHero";
import { TodayPlanCard } from "./components/TodayPlanCard";
import { RoundActions } from "./components/RoundActions";
import { FeedbackStack } from "./components/FeedbackCard";
import { WeeklyReportCard } from "./components/WeeklyReportCard";
import { WeeklyTrialCard } from "./components/WeeklyTrialCard";
import { ExamCountdown } from "./components/ExamCountdown";
import { MorningBriefing } from "./components/MorningBriefing";
import { getAllSubjects } from "../trial/trialTypes";
import * as H from "../../lib/haptics";


function HomeSkeleton() {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 60, gap: SPACING.md }}>
      <SkeletonCard height={24} width={160} rounded={8} />
      <SkeletonCard height={160} />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <SkeletonCard height={110} width="48%" />
        <SkeletonCard height={110} width="48%" />
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
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
  const { reward, xpToast, dismissXP, levelUpModal, dismissLevelUp } = useGamification();
  const { comeback, dismissComeback } = useRetention(reward);
  const dailyGoal = useSelector(selectDailyQuestionsGoal);

  const QUICK_PRIMARY = useMemo(() => [
    { icon: "play",     label: "Çalış",       go: SCREENS.STUDY_TIMER,    color: C.orange },
    { icon: "chart",    label: "Deneme",      go: SCREENS.TRIAL_ENTRY,    color: C.blue },
    { icon: "camera",   label: "Yanlış Ekle", go: SCREENS.ADD_WRONG,      color: C.pink },
    { icon: "notebook", label: "Defterim",    go: SCREENS.WRONG_NOTEBOOK, color: C.brandLight },
  ], [C]);
  const QUICK_SECONDARY = useMemo(() => [
    { icon: "target",   label: "5dk Quiz",    go: SCREENS.QUICK_PRACTICE, color: C.teal },
    { icon: "clock",    label: "Simülasyon",  go: SCREENS.EXAM_SIMULATOR, color: C.amber },
    { icon: "users",    label: "Challenge",   go: SCREENS.CHALLENGE,      color: C.pink },
    { icon: "trophy",   label: "Sıralama",    go: SCREENS.LEAGUE,         color: C.amber },
  ], [C]);
  const streak = useSelector(selectStreak);
  const freezeCount = useSelector(selectFreezeCount);
  const todayLogs = useSelector(selectTodayLogs);
  const trials = useSelector(selectTrials);
  const xp = useSelector(selectXP);

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

  // Hedef ilk kez aşıldığında günde bir kez XP ödülü ver.
  // Ref date-keyed; geceyarısı geçince yeni gün için sıfırlanır.
  const goalRewarded = useRef({ date: null, fired: false });
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
      setTimeout(() => setGoalCompleteVisible(true), 1500);
    });
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />}
      >
        <HomeHeader
          name={displayName}
          streak={streak}
          onProfilePress={go(SCREENS.PROFILE)}
          onStreakPress={go(SCREENS.CALENDAR)}
          onCalendarPress={go(SCREENS.CALENDAR)}
        />

        <View style={{ marginTop: 4 }}>
          <ExamCountdown onPress={go(SCREENS.GOALS)} />
        </View>

        <MorningBriefing
          userName={displayName}
          planTaskCount={plan.dersler}
          srDueCount={planCtx.srDue}
          streak={streak}
          onStart={go(SCREENS.PLAN_DETAIL)}
        />

        {/* HERO — Whoop ringi: dev animasyonlu ilerleme + nabız atan streak + stat rayı */}
        <View style={{ marginTop: 8 }}>
          <HomeHero
            solved={solvedToday}
            goal={dailyGoal}
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

        <View style={{ marginTop: 36 }}>
          <SectionLabel>HIZLI İŞLEM</SectionLabel>
          <RoundActions items={QUICK_PRIMARY} secondaryItems={QUICK_SECONDARY} onPress={(q) => q.go && navigation.navigate(q.go)} />
        </View>

        <View style={{ marginTop: 40 }}>
          <SectionLabel>SENİN İÇİN</SectionLabel>
          <View style={{ gap: 10 }}>
          <AnimatedCard delay={40}>
            <TodayPlanCard
              generatedTasks={generatedTasks}
              aiSuggestion={dailyAction}
              planSummary={plan}
              onViewAll={go(SCREENS.PLAN_DETAIL)}
              onAddTask={go(SCREENS.ADD_TASK)}
            />
          </AnimatedCard>

          {planCtx.srDue > 0 ? (
            <AnimatedCard delay={80}>
              <Pressable onPress={go(SCREENS.REVIEW_SESSION)} accessibilityRole="button" accessibilityLabel={`${planCtx.srDue} yanlışın tekrar zamanı geldi`} accessibilityHint="Tekrar oturumuna gider">
                <View style={{
                  flexDirection: "row", alignItems: "center", gap: 12, padding: 16,
                  borderRadius: 22, backgroundColor: C.coral + "14",
                  borderWidth: 1, borderColor: C.coral + "28",
                }}>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.coral + "24", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="refresh" size={22} color={C.coral} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: C.coral, letterSpacing: 0.6 }}>BUGÜN TEKRAR</Text>
                    <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: C.text, marginTop: 2 }}>
                      {planCtx.srDue} yanlışın tekrar zamanı geldi
                    </Text>
                  </View>
                  <Icon name="arrowR" size={18} color={C.coral} />
                </View>
              </Pressable>
            </AnimatedCard>
          ) : null}

          <AnimatedCard delay={160}>
            <WeeklyReportCard report={weeklyReport} onPress={go(SCREENS.WEEKLY_REVIEW)} />
          </AnimatedCard>

          <AnimatedCard delay={180}>
            <WeeklyTrialCard report={weeklyTrialReport} onPress={go(SCREENS.WEEKLY_TRIAL_REVIEW)} />
          </AnimatedCard>

          </View>
        </View>

        {nudges.length > 0 ? (
          <View style={{ marginTop: 36 }}>
            <SectionLabel>GERİ BİLDİRİM</SectionLabel>
            <FeedbackStack
              nudges={nudges}
              max={2}
              onAction={(nudge) => {
                if (nudge.subject) navigation.navigate(SCREENS.ANALYSIS);
                else navigation.navigate(SCREENS.PLAN_DETAIL);
              }}
            />
          </View>
        ) : null}
      </ScrollView>

      <XPToast amount={xpToast.amount} visible={xpToast.visible} onDone={dismissXP} />

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
