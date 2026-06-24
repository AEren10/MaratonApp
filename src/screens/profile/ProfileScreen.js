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
import { selectLevel, selectXP, selectBadgeIds, selectStats } from "../../store/slices/gamificationSlice";
import { selectStreak } from "../../store/slices/studyLogSlice";
import { selectTrials } from "../../store/slices/trialSlice";
import { getBadges, LEAGUE_TIERS } from "../../constants/gamification";
import { useCurriculum } from "../../hooks/useCurriculum";
import { Icon, SectionLabel } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";

import { MinimalHeader } from "./components/MinimalHeader";
import { ProfileHeader } from "./components/ProfileHeader";
import { CareerStats } from "./components/CareerStats";
import { BadgeRow } from "./components/BadgeRow";
import { StrengthBars } from "./components/StrengthBars";

export default function ProfileScreen() {
  const C = useC();
  const nav = useNavigation();
  const { user } = useAuth();
  const { examType, field } = useExam();
  const { subjects = [] } = useCurriculum();
  const level = useAppSelector(selectLevel);
  const totalXP = useAppSelector(selectXP);
  const unlockedIds = useAppSelector(selectBadgeIds);
  const gStats = useAppSelector(selectStats);
  const streak = useAppSelector(selectStreak);
  const trials = useAppSelector(selectTrials);

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Kullanıcı";

  const examLabel = useMemo(() => {
    if (examType === "tyt") return "Sadece TYT";
    if (examType === "dil") return "YKS Dil";
    if (field === "sayisal") return "TYT + AYT Sayısal";
    if (field === "ea") return "TYT + AYT Eşit Ağırlık";
    if (field === "sozel") return "TYT + AYT Sözel";
    return "YKS";
  }, [examType, field]);

  const league = useMemo(() => {
    const sorted = [...LEAGUE_TIERS].sort((a, b) => b.minRank - a.minRank);
    const tier = sorted.find((t) => totalXP >= t.minRank) || LEAGUE_TIERS[0];
    return { name: tier.name, icon: tier.icon, color: tier.color };
  }, [totalXP]);

  const allBadges = useMemo(() => getBadges(C), [C]);

  const careerStats = useMemo(() => {
    const totalQ = gStats.totalQuestions || 0;
    const totalMin = gStats.totalMinutes || 0;
    const hours = Math.floor(totalMin / 60);
    const trialCount = gStats.totalTrials || trials.length;
    return { totalQuestions: totalQ, totalHours: hours, trialCount };
  }, [gStats, trials]);

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
            level={level}
            league={league}
            streak={streak}
          />
        </Animated.View>

        {/* Career stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(350).springify()}>
          <CareerStats
            totalQuestions={careerStats.totalQuestions}
            totalHours={careerStats.totalHours}
            trialCount={careerStats.trialCount}
          />
        </Animated.View>

        {/* Badges */}
        <Animated.View entering={FadeInDown.delay(200).duration(350).springify()}
          style={{ marginTop: SPACING.xl }}
        >
          <BadgeRow allBadges={allBadges} earnedIds={unlockedIds} />
        </Animated.View>

        {/* Strengths */}
        {strengths.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(300).duration(350).springify()}
            style={{ marginTop: SPACING.xl }}
          >
            <StrengthBars strengths={strengths} />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(300).duration(350).springify()}
            style={{ marginTop: SPACING.xl }}
          >
            <Text style={{ ...TYPOGRAPHY.label, color: C.sec, marginBottom: SPACING.md }}>
              GÜÇLÜ YÖNLERİN
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
