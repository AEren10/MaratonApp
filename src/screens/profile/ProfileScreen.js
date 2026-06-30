import { useMemo } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useAuth } from "../../contexts/AuthContext";
import { useExam } from "../../contexts/ExamContext";
import { SwipeToHome } from "../../components/common/SwipeToHome";
import { useAppSelector } from "../../store/hooks";
import { selectLevel, selectXP, selectStats, selectWeeklyXP } from "../../store/slices/gamificationSlice";
import { selectStreak, selectLongestStreak } from "../../store/slices/studyLogSlice";
import { useCurriculum } from "../../hooks/useCurriculum";
import { Icon, SectionLabel } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { getTier, getNextTier } from "../../constants/league";
import { selectTrials } from "../../store/slices/trialSlice";

import { MinimalHeader } from "./components/MinimalHeader";
import { ProfileHeader } from "./components/ProfileHeader";
import { CareerStats } from "./components/CareerStats";
import { StrengthBars } from "./components/StrengthBars";
import { LevelBar } from "./components/LevelBar";
import { LeagueMiniCard } from "./components/LeagueMiniCard";
import { ActivityHeatmap } from "./components/ActivityHeatmap";

export default function ProfileScreen() {
  const C = useC();
  const nav = useNavigation();
  const { user } = useAuth();
  const { examType, field } = useExam();
  const { subjects = [] } = useCurriculum();
  const level = useAppSelector(selectLevel);
  const totalXP = useAppSelector(selectXP);
  const gStats = useAppSelector(selectStats);
  const streak = useAppSelector(selectStreak);
  const longestStreak = useAppSelector(selectLongestStreak);
  const weeklyXP = useAppSelector(selectWeeklyXP);
  const trials = useAppSelector(selectTrials);

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Kullanıcı";

  const examLabel = useMemo(() => {
    if (examType === "tyt") return "Sadece TYT";
    if (examType === "dil") return "YKS Dil";
    if (field === "sayisal") return "TYT + SAY";
    if (field === "ea") return "TYT + EA";
    if (field === "sozel") return "TYT + SÖZ";
    return "YKS";
  }, [examType, field]);

  const leagueTier = useMemo(() => getTier(weeklyXP), [weeklyXP]);
  const leagueNextTier = useMemo(() => getNextTier(weeklyXP), [weeklyXP]);

  const careerStats = useMemo(() => {
    const totalQ = gStats.totalQuestions || 0;
    const totalMin = gStats.totalMinutes || 0;
    const hours = Math.floor(totalMin / 60);
    return { totalQuestions: totalQ, totalHours: hours };
  }, [gStats]);

  const strengths = useMemo(() => {
    if (!trials.length) return [];
    const latest = trials[0];
    const subjectMap = {};
    subjects.forEach((s) => { subjectMap[s.key] = s; });

    const entries = [];
    Object.entries(latest.subjects || {}).forEach(([key, data]) => {
      const total = (data.correct || 0) + (data.wrong || 0);
      if (total < 5) return;
      const acc = Math.round(((data.correct || 0) / total) * 100);
      const norm = key.replace(/^tyt_/, "").replace(/^ayt_/, "");
      const subj = subjectMap[norm] || subjectMap[key];
      entries.push({ name: subj?.label || norm, c: subj?.color || C.muted, v: acc });
    });
    return entries.sort((a, b) => b.v - a.v).slice(0, 6);
  }, [subjects, trials, C]);

  return (
    <SwipeToHome>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <MinimalHeader />
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <Animated.View entering={FadeInDown.duration(350).springify()}>
            <ProfileHeader
              name={displayName}
              exam={examLabel}
              streak={streak}
            />
          </Animated.View>

          {/* Level bar */}
          <Animated.View entering={FadeInDown.delay(60).duration(350).springify()}>
            <LevelBar
              level={level?.level}
              title={level?.title}
              progress={level?.progress}
              xpInLevel={level?.xpInLevel}
              xpForNext={level?.xpForNext}
            />
          </Animated.View>

          {/* Career stats */}
          <Animated.View entering={FadeInDown.delay(100).duration(350).springify()}>
            <CareerStats
              totalQuestions={careerStats.totalQuestions}
              totalHours={careerStats.totalHours}
              longestStreak={longestStreak}
            />
          </Animated.View>

          {/* League mini-card */}
          <Animated.View entering={FadeInDown.delay(160).duration(350).springify()}>
            <LeagueMiniCard
              tier={leagueTier}
              nextTier={leagueNextTier}
              weeklyXP={weeklyXP}
            />
          </Animated.View>

          {/* Monthly activity heatmap */}
          <Animated.View entering={FadeInDown.delay(220).duration(350).springify()}>
            <ActivityHeatmap />
          </Animated.View>

          {/* Strength bars */}
          {strengths.length > 0 ? (
            <Animated.View entering={FadeInDown.delay(300).duration(350).springify()}>
              <StrengthBars strengths={strengths} />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.delay(300).duration(350).springify()}
              style={{ marginTop: SPACING.xl }}
            >
              <Text style={{ ...TYPOGRAPHY.label, color: C.sec, marginBottom: SPACING.md }}>
                GÜÇ HARİTASI
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => nav.navigate(SCREENS.TRIAL_ENTRY)}
                style={({ pressed }) => ({
                  backgroundColor: C.surface,
                  borderRadius: RADIUS.xxl,
                  borderWidth: 1, borderColor: C.border,
                  padding: SPACING.xl,
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Icon name="chart" size={24} color={C.muted} style={{ marginBottom: SPACING.sm }} />
                <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.sec, textAlign: "center" }}>
                  Denemeni gir, güçlerin burada görünsün
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </SwipeToHome>
  );
}
