import { useCallback, useMemo } from "react";
import { ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { C } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { useAuth } from "../../contexts/AuthContext";
import { useExam } from "../../contexts/ExamContext";
import { AnimatedCard } from "../../components/design/AnimatedCard";
import { useAppSelector } from "../../store/hooks";
import { selectLevel, selectXP, selectBadgeIds, selectStats } from "../../store/slices/gamificationSlice";
import { selectTodayLogs, selectStreak } from "../../store/slices/studyLogSlice";
import { selectTrials } from "../../store/slices/trialSlice";
import { BADGES } from "../../constants/gamification";
import { useCurriculum } from "../../hooks/useCurriculum";

import { ProfileHeader } from "./components/ProfileHeader";
import { StatsGrid } from "./components/StatsGrid";
import { BadgeRow } from "./components/BadgeRow";
import { StrengthBars } from "./components/StrengthBars";
import { SettingsMenu } from "./components/SettingsMenu";
import { LevelBar } from "./components/LevelBar";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { examType, field, daysUntilExam } = useExam();
  const { subjects } = useCurriculum();
  const level = useAppSelector(selectLevel);
  const totalXP = useAppSelector(selectXP);
  const unlockedIds = useAppSelector(selectBadgeIds);
  const gStats = useAppSelector(selectStats);
  const streak = useAppSelector(selectStreak);
  const todayLogs = useAppSelector(selectTodayLogs);
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

  const earnedBadges = BADGES.filter((b) => unlockedIds.includes(b.id));
  const displayBadges = earnedBadges.length > 0
    ? earnedBadges.map((b) => ({ icon: b.icon, name: b.name, color: b.color }))
    : [];

  const computedStats = useMemo(() => {
    const totalQ = gStats.totalQuestions || todayLogs.reduce((s, l) => s + (l.questionCount || 0), 0);
    const totalMin = todayLogs.reduce((s, l) => s + (l.minutes || 0), 0);
    const hours = Math.floor(totalMin / 60);
    const trialCount = gStats.totalTrials || trials.length;
    const bestStreak = streak > (gStats.streak || 0) ? streak : (gStats.streak || 0);
    return [
      { v: totalQ > 999 ? `${(totalQ / 1000).toFixed(1)}k` : String(totalQ), l: "toplam soru" },
      { v: String(hours), l: "saat çalışma" },
      { v: String(trialCount), l: "deneme" },
      { v: String(bestStreak), l: "gün en uzun seri" },
    ];
  }, [gStats, todayLogs, trials, streak]);

  const strengths = useMemo(() => {
    const qBySubject = {};
    todayLogs.forEach((l) => {
      const key = l.subject;
      qBySubject[key] = (qBySubject[key] || 0) + (l.questionCount || 0);
    });
    const subjectMap = {};
    subjects.forEach((s) => { subjectMap[s.key] = s; });
    const entries = Object.entries(qBySubject)
      .map(([key, q]) => ({ key, q, label: subjectMap[key]?.label || key, color: subjectMap[key]?.color || C.muted }))
      .sort((a, b) => b.q - a.q);
    const maxQ = entries[0]?.q || 1;
    if (entries.length > 0) {
      return entries.slice(0, 6).map((e) => ({
        name: e.label,
        c: e.color,
        v: Math.round((e.q / maxQ) * 100),
      }));
    }
    return subjects.slice(0, 6).map((s) => ({
      name: s.label,
      c: s.color,
      v: 0,
    }));
  }, [subjects, todayLogs]);

  const handleNavigate = (route) => {
    navigation.navigate(route);
  };

  const handleLogout = useCallback(() => {
    Alert.alert("Cikis Yap", "Hesabindan cikis yapmak istedigin kesin mi?", [
      { text: "Iptal", style: "cancel" },
      { text: "Cikis Yap", style: "destructive", onPress: logout },
    ]);
  }, [logout]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedCard delay={0}>
          <ProfileHeader
            name={displayName}
            exam={examLabel}
            league={totalXP >= 10000 ? { name: "Obsidyen Lig", icon: "crown" } : totalXP >= 5000 ? { name: "Elmas Lig", icon: "award" } : totalXP >= 2000 ? { name: "Altin Lig", icon: "trophy" } : totalXP >= 500 ? { name: "Gumus Lig", icon: "medal" } : { name: "Bronz Lig", icon: "medal" }}
            countdown={daysUntilExam}
          />
        </AnimatedCard>
        <AnimatedCard delay={80}>
          <LevelBar
            level={level.level}
            title={level.title}
            progress={level.progress}
            xpInLevel={level.xpInLevel}
            xpForNext={level.xpForNext}
          />
        </AnimatedCard>
        <AnimatedCard delay={120}>
          <StatsGrid stats={computedStats} />
        </AnimatedCard>
        <AnimatedCard delay={200}>
          <BadgeRow badges={displayBadges} />
        </AnimatedCard>
        <AnimatedCard delay={240}>
          <StrengthBars strengths={strengths} />
        </AnimatedCard>
        <AnimatedCard delay={320}>
          <SettingsMenu
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        </AnimatedCard>
      </ScrollView>
    </SafeAreaView>
  );
}
