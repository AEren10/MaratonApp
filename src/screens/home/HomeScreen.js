import React, { useState, useCallback, useEffect, useMemo } from "react";
import { ScrollView, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useAuth } from "../../contexts/AuthContext";
import { useExam } from "../../contexts/ExamContext";
import { selectStreak, selectTodayLogs } from "../../store/slices/studyLogSlice";
import { selectTrials } from "../../store/slices/trialSlice";
import { selectStats, selectXP } from "../../store/slices/gamificationSlice";
import { generateDailyPlan } from "../../lib/planEngine";
import { C, SPACING } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { AnimatedCard } from "../../components/design/AnimatedCard";

import { useRecommendations } from "../../hooks/useRecommendations";
import { useWeeklyReport } from "../../hooks/useWeeklyReport";
import { useAISuggestions } from "../../hooks/useAISuggestions";
import { useSync } from "../../contexts/DataSyncContext";
import { NudgeModal } from "../../components/common/NudgeModal";
import { getMotivMessage } from "../../lib/motivMessages";
import { HomeHeader } from "./components/HomeHeader";
import { PlanCard } from "./components/PlanCard";
import { DenemeCard } from "./components/DenemeCard";
import { StreakCard } from "./components/StreakCard";
import { LiveCard } from "./components/LiveCard";
import { LeagueCard } from "./components/LeagueCard";
import { WeakCard } from "./components/WeakCard";
import { MotivCard } from "./components/MotivCard";
import { QuickActions } from "./components/QuickActions";
import { WeeklyReportCard } from "./components/WeeklyReportCard";
import { AISuggestionsCard } from "./components/AISuggestionsCard";

const QUICK_ITEMS = [
  { icon: "edit", label: "Kaydet", c: C.amber, go: SCREENS.ADD_STUDY },
  { icon: "chart", label: "Deneme Gir", c: C.blue, go: SCREENS.TRIAL_ENTRY },
  { icon: "camera", label: "Yanlış Ekle", c: C.red, go: SCREENS.ADD_WRONG },
  { icon: "notebook", label: "Yanlış Defteri", c: C.purple, go: SCREENS.WRONG_NOTEBOOK },
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
  const { examDate } = useExam();
  const streak = useSelector(selectStreak);
  const todayLogs = useSelector(selectTodayLogs);
  const trials = useSelector(selectTrials);
  const gStats = useSelector(selectStats);
  const xp = useSelector(selectXP);

  const nudges = useRecommendations();
  const weeklyReport = useWeeklyReport();
  const { suggestions: aiSuggestions, loading: aiLoading } = useAISuggestions();
  const { refresh } = useSync();
  const [nudgeVisible, setNudgeVisible] = useState(false);

  const go = (route) => () => navigation.navigate(route);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Öğrenci";

  const plan = useMemo(() => {
    const generated = generateDailyPlan({ examDate });
    const totalQ = todayLogs.reduce((s, l) => s + (l.questionCount || 0), 0);
    const estHours = generated.estimatedMinutes >= 60
      ? `~${Math.round(generated.estimatedMinutes / 60)} saat`
      : `~${generated.estimatedMinutes} dk`;
    return { total: generated.totalQuestions, done: totalQ, dersler: generated.tasks.length, hours: estHours };
  }, [todayLogs, examDate]);

  const lastDeneme = useMemo(() => {
    if (!trials.length) return { net: 0, trend: 0, bars: [] };
    const latest = trials[0];
    // pair against same-type previous for fair trend
    const prev = trials.slice(1).find((t) => t.trialType === latest.trialType);
    const net = latest.totalNet || 0;
    const trend = prev ? net - (prev.totalNet || 0) : 0;
    const bars = Object.entries(latest.subjects || {}).slice(0, 4).map(([key, s]) => {
      const palette = {
        tyt_turkce: "#60A5FA",
        tyt_matematik: "#F5A623",
        tyt_fen: "#34D399",
        tyt_sosyal: "#A78BFA",
        ayt_matematik: "#F5A623",
        ayt_fizik: "#60A5FA",
        ayt_kimya: "#2DD4BF",
        ayt_biyoloji: "#34D399",
        ayt_edebiyat: "#A78BFA",
        ayt_tarih1: "#EF4444",
        ayt_cografya1: "#34D399",
      };
      return {
        c: palette[key] || "#F5A623",
        v: Math.min(1, Math.max(0, (s.net || 0) / 40)),
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
            <PlanCard
              plan={plan}
              onPress={go(SCREENS.PLAN_DETAIL)}
              onStart={go(SCREENS.PLAN_DETAIL)}
            />
          </AnimatedCard>

          <AnimatedCard delay={80}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <DenemeCard data={lastDeneme} onPress={go(SCREENS.ANALYSIS)} />
              <StreakCard streak={streak} best={gStats.streak || streak} onPress={go(SCREENS.PROFILE)} />
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

          <AnimatedCard delay={260}>
            <AISuggestionsCard
              suggestions={aiSuggestions}
              loading={aiLoading}
              onItemPress={(s) => {
                if (s.subjectKey) {
                  navigation.navigate(SCREENS.SUBJECT_DETAIL, { subjectKey: s.subjectKey, subjectName: s.title });
                }
              }}
            />
          </AnimatedCard>

          <AnimatedCard delay={300}>
            <WeakCard
              message={nudges.length > 0 ? nudges[0].message : (gStats.totalQuestions ? "Analiz ekranında zayıf konularını görebilirsin" : "Soru çözmeye başla, zayıf alanlarını belirleyelim")}
              onPress={nudges.length > 0 ? () => setNudgeVisible(true) : go(SCREENS.ANALYSIS)}
            />
          </AnimatedCard>

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

      <NudgeModal
        visible={nudgeVisible}
        nudges={nudges}
        onClose={() => setNudgeVisible(false)}
        onAction={(nudge) => {
          setNudgeVisible(false);
          if (nudge.subject) navigation.navigate(SCREENS.SUBJECT_DETAIL, { subjectKey: nudge.subject });
          else navigation.navigate(SCREENS.PLAN_DETAIL);
        }}
      />
    </SafeAreaView>
  );
}
