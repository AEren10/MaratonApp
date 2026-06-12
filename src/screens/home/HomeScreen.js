import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { ScrollView, View, Text, Pressable, RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useAuth } from "../../contexts/AuthContext";
import { selectStreak, selectTodayLogs, selectFreezeCount } from "../../store/slices/studyLogSlice";
import { selectTrials } from "../../store/slices/trialSlice";
import { selectStats, selectXP } from "../../store/slices/gamificationSlice";
import { selectDailyQuestionsGoal } from "../../store/slices/goalsSlice";
import { generateDailyPlan } from "../../lib/planEngine";
import { usePlanContext } from "../../hooks/usePlanContext";
import { useAppDispatch } from "../../store/hooks";
import { addAdHocTask } from "../../store/slices/planSlice";
import { getSubjectByKey } from "../../themes/subjects";
import { C, SPACING } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { AnimatedCard } from "../../components/design/AnimatedCard";
import { Icon } from "../../components/design";

import { useRecommendations } from "../../hooks/useRecommendations";
import { useWeeklyReport } from "../../hooks/useWeeklyReport";
import { useAISuggestions } from "../../hooks/useAISuggestions";
import { useSync } from "../../contexts/DataSyncContext";
import { NudgeModal } from "../../components/common/NudgeModal";
import { getMotivMessage } from "../../lib/motivMessages";
import { useGamification } from "../../hooks/useGamification";
import { XPToast } from "../../components/common/XPToast";
import { HomeHeader } from "./components/HomeHeader";
import { DailyGoalCard } from "./components/DailyGoalCard";
import { PlanCard } from "./components/PlanCard";
import { DenemeCard } from "./components/DenemeCard";
import { StreakCard } from "./components/StreakCard";
import { LiveCard } from "./components/LiveCard";
import { LeagueCard } from "./components/LeagueCard";
import { WeakCard } from "./components/WeakCard";
import { MotivCard } from "./components/MotivCard";
import { QuickActions } from "./components/QuickActions";
import { WeeklyReportCard } from "./components/WeeklyReportCard";
import { DailyActionCard } from "./components/DailyActionCard";
import { TRIAL_TO_CURRICULUM } from "../../screens/trial/trialKeyMap";
import { ALL_SUBJECTS } from "../trial/trialTypes";

const QUICK_ITEMS = [
  { icon: "edit", label: "Kaydet", c: C.amber, go: SCREENS.ADD_STUDY },
  { icon: "chart", label: "Deneme Gir", c: C.blue, go: SCREENS.TRIAL_ENTRY },
  { icon: "camera", label: "Yanlış Ekle", c: C.red, go: SCREENS.ADD_WRONG },
  { icon: "notebook", label: "Yanlış Defteri", c: C.purple, go: SCREENS.WRONG_NOTEBOOK },
  { icon: "barChart", label: "Net Simülatörü", c: C.teal, go: SCREENS.RANK_SIMULATOR },
  { icon: "calendar", label: "Yol Haritası", c: C.green, go: SCREENS.ROADMAP },
];

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
  const { user } = useAuth();
  const { reward, xpToast, dismissXP } = useGamification();
  const dailyGoal = useSelector(selectDailyQuestionsGoal);
  const streak = useSelector(selectStreak);
  const freezeCount = useSelector(selectFreezeCount);
  const todayLogs = useSelector(selectTodayLogs);
  const trials = useSelector(selectTrials);
  const gStats = useSelector(selectStats);
  const xp = useSelector(selectXP);

  const dispatch = useAppDispatch();
  const planCtx = usePlanContext();
  const nudges = useRecommendations();
  const weeklyReport = useWeeklyReport();
  const { suggestions: aiSuggestions, loading: aiLoading } = useAISuggestions();
  const { refresh } = useSync();
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [actionDismissed, setActionDismissed] = useState(false);

  const todayActionKey = `@daily_action_done_${new Date().toISOString().split("T")[0]}`;
  useEffect(() => {
    AsyncStorage.getItem(todayActionKey).then((v) => { if (v) setActionDismissed(true); });
  }, [todayActionKey]);

  const dailyAction = aiSuggestions && aiSuggestions.length ? aiSuggestions[0] : null;

  const addActionToPlan = useCallback(() => {
    if (!dailyAction) return;
    const tKey = dailyAction.subjectKey;
    const curr = tKey ? (TRIAL_TO_CURRICULUM[tKey]?.[0] || tKey) : null;
    if (curr) {
      const subj = getSubjectByKey(curr);
      dispatch(addAdHocTask({
        subject: curr,
        subjectLabel: subj?.label || dailyAction.title,
        reason: dailyAction.body,
        questionCount: 20,
        color: subj?.color || dailyAction.color,
      }));
    }
    AsyncStorage.setItem(todayActionKey, "1");
    setActionDismissed(true);
    navigation.navigate(SCREENS.PLAN_DETAIL);
  }, [dailyAction, dispatch, navigation, todayActionKey]);

  const dismissAction = useCallback((persist) => {
    if (persist) AsyncStorage.setItem(todayActionKey, "1");
    setActionDismissed(true);
  }, [todayActionKey]);

  const go = (route) => () => navigation.navigate(route);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Öğrenci";

  const solvedToday = useMemo(
    () => todayLogs.reduce((s, l) => s + (l.questionCount || 0), 0),
    [todayLogs]
  );

  // Hedef ilk kez aşıldığında günde bir kez XP ödülü ver.
  const goalRewarded = useRef(false);
  useEffect(() => {
    const goal = dailyGoal > 0 ? dailyGoal : 100;
    if (solvedToday < goal || goalRewarded.current) return;
    const todayKey = `@daily_goal_done_${new Date().toISOString().split("T")[0]}`;
    AsyncStorage.getItem(todayKey).then((done) => {
      if (done || goalRewarded.current) return;
      goalRewarded.current = true;
      AsyncStorage.setItem(todayKey, "1");
      reward("daily_goal_complete");
    });
  }, [solvedToday, dailyGoal, reward]);

  const { plan, topTask } = useMemo(() => {
    const generated = generateDailyPlan(planCtx);
    const totalQ = todayLogs.reduce((s, l) => s + (l.questionCount || 0), 0);
    const estHours = generated.estimatedMinutes >= 60
      ? `~${Math.round(generated.estimatedMinutes / 60)} saat`
      : `~${generated.estimatedMinutes} dk`;
    return {
      plan: { total: generated.totalQuestions, done: totalQ, dersler: generated.tasks.length, hours: estHours },
      topTask: generated.tasks[0] || null,
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
      const subj = ALL_SUBJECTS.find((x) => x.key === key);
      return {
        c: subj?.color || C.amber,
        v: Math.min(1, Math.max(0, (s.net || 0) / (subj?.max || 40))),
      };
    });
    return { net, trend, bars };
  }, [trials]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
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
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.amber} colors={[C.amber]} />}
      >
        <HomeHeader
          name={displayName}
          streak={streak}
          onStreakPress={go(SCREENS.PROFILE)}
          onCalendarPress={go(SCREENS.CALENDAR)}
        />

        <View style={{ gap: 12 }}>
          <AnimatedCard delay={0}>
            <DailyGoalCard
              solved={solvedToday}
              goal={dailyGoal}
              onPress={go(SCREENS.ADD_STUDY)}
            />
          </AnimatedCard>

          <AnimatedCard delay={40}>
            <PlanCard
              plan={plan}
              onPress={go(SCREENS.PLAN_DETAIL)}
              onStart={go(SCREENS.PLAN_DETAIL)}
            />
          </AnimatedCard>

          {topTask ? (
            <Pressable onPress={go(SCREENS.PLAN_DETAIL)} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4, marginTop: -4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: topTask.color || C.amber }} />
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: C.muted, flex: 1 }} numberOfLines={1}>
                Öncelik: {topTask.topicLabel || topTask.subjectLabel} — {topTask.reason}
              </Text>
            </Pressable>
          ) : null}

          <AnimatedCard delay={80}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <DenemeCard data={lastDeneme} onPress={go(SCREENS.ANALYSIS)} />
              <StreakCard streak={streak} best={gStats.streak || streak} freezeCount={freezeCount} onPress={go(SCREENS.PROFILE)} />
            </View>
          </AnimatedCard>

          <AnimatedCard delay={160}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <LeagueCard league={{ tier: xp >= 10000 ? "Obsidyen" : xp >= 5000 ? "Elmas" : xp >= 2000 ? "Altın" : xp >= 500 ? "Gümüş" : "Bronz", xp }} onPress={go(SCREENS.LEAGUE)} />
              <LiveCard count={0} avatars={[]} onPress={go(SCREENS.STUDY_TIMER)} />
            </View>
          </AnimatedCard>

          <AnimatedCard delay={220}>
            <WeeklyReportCard report={weeklyReport} onPress={go(SCREENS.CALENDAR)} />
          </AnimatedCard>

          {planCtx.srDue > 0 ? (
            <AnimatedCard delay={240}>
              <Pressable
                onPress={go(SCREENS.REVIEW_SESSION)}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 12,
                  backgroundColor: C.surface, borderRadius: 24,
                  borderWidth: 1, borderColor: C.amber + "55", padding: 16,
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.amber + "1A", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="refresh" size={22} color={C.amber} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: C.amber, letterSpacing: 0.6 }}>BUGÜN TEKRAR</Text>
                  <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: C.text, marginTop: 2 }}>
                    {planCtx.srDue} yanlışın tekrar zamanı geldi
                  </Text>
                </View>
                <Icon name="arrowR" size={18} color={C.amber} />
              </Pressable>
            </AnimatedCard>
          ) : null}

          {!actionDismissed && (dailyAction || aiLoading) ? (
            <AnimatedCard delay={260}>
              <DailyActionCard
                suggestion={dailyAction}
                loading={aiLoading}
                onAdd={addActionToPlan}
                onUnderstood={() => dismissAction(true)}
                onLater={() => dismissAction(false)}
              />
            </AnimatedCard>
          ) : (
            <AnimatedCard delay={300}>
              <WeakCard
                message={nudges.length > 0 ? nudges[0].message : (gStats.totalQuestions ? "Analiz ekranında zayıf konularını görebilirsin" : "Soru çözmeye başla, zayıf alanlarını belirleyelim")}
                onPress={nudges.length > 0 ? () => setNudgeVisible(true) : go(SCREENS.ANALYSIS)}
              />
            </AnimatedCard>
          )}

          <AnimatedCard delay={320}>
            <MotivCard message={getMotivMessage({ totalQuestions: gStats.totalQuestions || 0, streak, totalTrials: gStats.totalTrials || 0, xp })} onPress={go(SCREENS.ANALYSIS)} />
          </AnimatedCard>
        </View>

        <AnimatedCard delay={400} style={{ marginTop: 22 }}>
          <QuickActions
            items={QUICK_ITEMS}
            onPress={(q) => q.go && navigation.navigate(q.go)}
          />
        </AnimatedCard>
      </ScrollView>

      <XPToast amount={xpToast.amount} visible={xpToast.visible} onDone={dismissXP} />

      <NudgeModal
        visible={nudgeVisible}
        nudges={nudges}
        onClose={() => setNudgeVisible(false)}
        onAction={(nudge) => {
          setNudgeVisible(false);
          if (nudge.actionLabel === "Plana Ekle" && nudge.subject) {
            const subj = getSubjectByKey(nudge.subject);
            dispatch(addAdHocTask({
              subject: nudge.subject,
              subjectLabel: subj?.label || nudge.subject,
              reason: nudge.message,
              questionCount: 15,
              color: subj?.color,
            }));
            navigation.navigate(SCREENS.PLAN_DETAIL);
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
