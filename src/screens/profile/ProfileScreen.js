import { useCallback, useMemo } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useAuth } from "../../contexts/AuthContext";
import { useExam } from "../../contexts/ExamContext";
import { GlowBackground, WARM_GLOW } from "../../components/design";
import { SwipeToHome } from "../../components/common/SwipeToHome";
import { AnimatedCard } from "../../components/design/AnimatedCard";
import { useAppSelector } from "../../store/hooks";
import { selectLevel, selectXP, selectBadgeIds, selectStats } from "../../store/slices/gamificationSlice";
import { selectTodayLogs, selectStreak } from "../../store/slices/studyLogSlice";
import { selectTrials } from "../../store/slices/trialSlice";
import { getBadges } from "../../constants/gamification";
import { useCurriculum } from "../../hooks/useCurriculum";

import { ProfileHeader } from "./components/ProfileHeader";
import { StatsGrid } from "./components/StatsGrid";
import { BadgeRow } from "./components/BadgeRow";
import { StrengthBars } from "./components/StrengthBars";
import { SettingsMenu } from "./components/SettingsMenu";
import { LevelBar } from "./components/LevelBar";

import { Icon, SectionLabel } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

const QUICK_LINK_ITEMS = [
  { icon: "users", label: "Challenge", screen: SCREENS.CHALLENGE },
  { icon: "share", label: "Paylaş", screen: SCREENS.SHARE_CARD, params: { type: "overall" } },
  { icon: "mail", label: "Davet Et", screen: SCREENS.REFERRAL },
  { icon: "target", label: "5dk Quiz", screen: SCREENS.QUICK_PRACTICE },
];

function QuickLinks({ onNavigate, C }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, marginVertical: SPACING.sm }}>
      {QUICK_LINK_ITEMS.map((item) => (
        <Pressable
          key={item.label}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          accessibilityHint={`${item.label} ekranına gider`}
          onPress={() => onNavigate(item.screen, item.params)}
          style={({ pressed }) => ({
            flex: 1, minWidth: "45%", flexDirection: "row", alignItems: "center", gap: SPACING.sm,
            backgroundColor: C.surface, borderRadius: RADIUS.xl,
            padding: SPACING.md, borderWidth: 1, borderColor: C.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center" }}>
            <Icon name={item.icon} size={15} color={C.sec} />
          </View>
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.text }}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function ProfileScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const showAlert = useAlert();
  const { examType, field, daysUntilExam } = useExam();
  const { subjects = [] } = useCurriculum();
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

  const earnedBadges = getBadges(C).filter((b) => unlockedIds.includes(b.id));
  const displayBadges = earnedBadges.length > 0
    ? earnedBadges.map((b) => ({ icon: b.icon, name: b.name, color: b.color }))
    : [];

  const computedStats = useMemo(() => {
    const totalQ = gStats.totalQuestions || todayLogs.reduce((s, l) => s + (l.questionCount || 0), 0);
    const totalMin = gStats.totalMinutes || todayLogs.reduce((s, l) => s + (l.duration || 0), 0);
    const hours = Math.floor(totalMin / 60);
    const trialCount = gStats.totalTrials || trials.length;
    const bestStreak = Math.max(streak, gStats.streak || 0);
    return [
      { v: totalQ > 999 ? `${(totalQ / 1000).toFixed(1)}k` : String(totalQ), l: "toplam soru", color: C.orange },
      { v: String(hours), l: "saat çalışma", color: C.purple },
      { v: String(trialCount), l: "deneme", color: C.blue },
      { v: String(bestStreak), l: "gün en uzun seri", color: C.green },
    ];
  }, [gStats, todayLogs, trials, streak, C]);

  // GERÇEK başarı verisi: derslerin denemedeki doğru/yanlış oranı.
  // Sahte %100 göstermemek için sadece veri varsa list dönüyor.
  const strengths = useMemo(() => {
    if (!trials.length) return [];
    const latest = trials[0];
    const subjectMap = {};
    subjects.forEach((s) => { subjectMap[s.key] = s; });

    const entries = [];
    Object.entries(latest.subjects || {}).forEach(([key, data]) => {
      const total = (data.correct || 0) + (data.wrong || 0);
      if (total < 5) return; // anlamlı veri için min 5 soru
      const acc = Math.round(((data.correct || 0) / total) * 100);
      const norm = key.replace(/^tyt_/, "").replace(/^ayt_/, "");
      const subj = subjectMap[norm] || subjectMap[key];
      entries.push({
        name: subj?.label || norm,
        c: subj?.color || C.muted,
        v: acc,
      });
    });
    return entries.sort((a, b) => b.v - a.v).slice(0, 6);
  }, [subjects, trials]);

  const handleNavigate = (route, params) => {
    navigation.navigate(route, params);
  };

  const handleLogout = useCallback(() => {
    H.warn();
    showAlert("Çıkış Yap", "Hesabından çıkış yapmak istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: logout },
    ]);
  }, [logout]);

  return (
    <SwipeToHome>
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <GlowBackground blobs={WARM_GLOW} />
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
        <View style={{ marginTop: SPACING.lg }}>
          <SectionLabel>İstatistik</SectionLabel>
        </View>
        <AnimatedCard delay={120}>
          <StatsGrid stats={computedStats} />
        </AnimatedCard>
        {displayBadges.length > 0 ? (
          <>
            <View style={{ marginTop: SPACING.lg }}>
              <SectionLabel>Rozetler</SectionLabel>
            </View>
            <AnimatedCard delay={200}>
              <BadgeRow badges={displayBadges} />
            </AnimatedCard>
          </>
        ) : null}
        {strengths.length > 0 ? (
          <>
            <View style={{ marginTop: SPACING.lg }}>
              <SectionLabel>Güçlü Yönler</SectionLabel>
            </View>
            <AnimatedCard delay={240}>
              <StrengthBars strengths={strengths} />
            </AnimatedCard>
          </>
        ) : null}
        <View style={{ marginTop: SPACING.lg }}>
          <SectionLabel>Hızlı Erişim</SectionLabel>
        </View>
        <AnimatedCard delay={300}>
          <QuickLinks onNavigate={handleNavigate} C={C} />
        </AnimatedCard>
        <View style={{ marginTop: SPACING.lg }}>
          <SectionLabel>Ayarlar</SectionLabel>
        </View>
        <AnimatedCard delay={360}>
          <SettingsMenu
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        </AnimatedCard>
      </ScrollView>
    </SafeAreaView>
    </SwipeToHome>
  );
}
