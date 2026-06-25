import { useMemo, useRef, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useC } from "../../contexts/ThemeContext";
import { useAlert } from "../../contexts/AlertContext";
import { useAuth } from "../../contexts/AuthContext";
import { useExam } from "../../contexts/ExamContext";
import { useWeeklyReport } from "../../hooks/useWeeklyReport";
import { selectStreak } from "../../store/slices/studyLogSlice";
import { selectXP } from "../../store/slices/gamificationSlice";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";

const fmtTime = (m) => {
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}s ${m % 60}dk` : `${m}dk`;
};

export default function ShareCardScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const nav = useNavigation();
  const { params } = useRoute();
  const type = params?.type ?? "weekly";

  const { user } = useAuth();
  const { examType, daysUntilExam } = useExam();
  const report = useWeeklyReport();
  const streak = useSelector(selectStreak);
  const xp = useSelector(selectXP);

  const cardRef = useRef(null);
  const showAlert = useAlert();
  const name = user?.user_metadata?.name || user?.email || "Maratoncu";

  const handleShare = useCallback(async () => {
    let captureRef, Sharing;
    try {
      ({ captureRef } = require("react-native-view-shot"));
      Sharing = require("expo-sharing");
    } catch {
      showAlert("Paylaşım kullanılamıyor");
      return;
    }
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      if (!(await Sharing.isAvailableAsync())) { showAlert("Paylaşım yok"); return; }
      await Sharing.shareAsync(`file://${uri}`, { mimeType: "image/png", dialogTitle: "Kartını paylaş" });
    } catch {
      showAlert("Hata", "Kart oluşturulamadı.");
    }
  }, []);
  const isWeekly = type === "weekly";
  const heroValue = isWeekly ? fmtTime(report.totalMinutes) : `${streak} Gün`;
  const heroLabel = isWeekly ? "Haftalık Çalışma" : "Günlük Seri";

  const grid = [
    { label: "Soru", value: report.totalQuestions, icon: "checkCircle", color: C.green },
    { label: "Deneme", value: report.trialCount, icon: "notebook", color: C.blue },
    { label: "Aktif Gün", value: report.activeDays, icon: "calendar", color: C.sec },
    { label: "Net Ort.", value: report.weekNetAvg, icon: "trendUp", color: C.accent },
  ];

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={24} color={C.text} />
        </Pressable>
        <Text style={s.title}>Paylaş</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={s.center}>
        <Animated.View ref={cardRef} entering={FadeInDown.duration(500)} style={s.card} collapsable={false}>
          {/* Brand + Badge */}
          <View style={s.brandRow}>
            <Text style={s.brand}>MARATON</Text>
            {examType && <View style={s.badge}><Text style={s.badgeText}>{examType.toUpperCase()}</Text></View>}
          </View>

          <Text style={s.name}>{name}</Text>

          {/* Hero stat */}
          <Text style={s.heroValue}>{heroValue}</Text>
          <Text style={s.heroLabel}>{heroLabel}</Text>

          {/* 2x2 grid */}
          <View style={s.grid}>
            {grid.map((g) => (
              <View key={g.label} style={s.gridItem}>
                <Icon name={g.icon} size={16} color={g.color} />
                <Text style={s.gridValue}>{g.value}</Text>
                <Text style={s.gridLabel}>{g.label}</Text>
              </View>
            ))}
          </View>

          {/* Bottom row */}
          <View style={s.bottom}>
            <View style={s.pill}><Text style={s.pillText}>🔥 {streak}</Text></View>
            <View style={s.pill}><Text style={s.pillText}>⚡ {xp} XP</Text></View>
            {daysUntilExam != null && (
              <View style={s.pill}><Text style={s.pillText}>{daysUntilExam} gün</Text></View>
            )}
          </View>

          <Text style={s.watermark}>maraton.app</Text>
        </Animated.View>
      </View>

      <Pressable onPress={handleShare} style={({ pressed }) => [s.shareBtn, pressed && { opacity: 0.85 }]}>
        <Icon name="share" size={18} color="#FFFFFF" />
        <Text style={s.shareBtnText}>Paylaş</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const makeStyles = (C) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  title: { ...TYPOGRAPHY.subheading, color: C.text },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { width: 300, aspectRatio: 9 / 16, backgroundColor: C.surface, borderRadius: RADIUS.xxl, borderWidth: 1, borderColor: C.border, padding: SPACING.xl, justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  brand: { ...TYPOGRAPHY.subheading, color: C.accent, letterSpacing: 3 },
  badge: { backgroundColor: C.accent + "22", paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm },
  badgeText: { ...TYPOGRAPHY.micro, color: C.accent },
  name: { ...TYPOGRAPHY.bodyMedium, color: C.sec, marginTop: SPACING.xs },
  heroValue: { ...TYPOGRAPHY.stat, color: C.text, textAlign: "center" },
  heroLabel: { ...TYPOGRAPHY.captionMedium, color: C.muted, textAlign: "center", marginTop: -SPACING.xs },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  gridItem: { width: "47%", backgroundColor: C.bg, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: "center", gap: SPACING.xs },
  gridValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 22, color: C.text },
  gridLabel: { ...TYPOGRAPHY.micro, color: C.muted },
  bottom: { flexDirection: "row", justifyContent: "center", gap: SPACING.sm },
  pill: { backgroundColor: C.bg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.pill },
  pillText: { ...TYPOGRAPHY.captionMedium, color: C.sec },
  watermark: { ...TYPOGRAPHY.micro, color: C.muted, textAlign: "center", opacity: 0.5 },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm, marginHorizontal: SPACING.xxxl, marginBottom: SPACING.xxl, paddingVertical: SPACING.md, borderRadius: RADIUS.xl, backgroundColor: C.accent },
  shareBtnText: { ...TYPOGRAPHY.button, color: "#FFFFFF" },
});
