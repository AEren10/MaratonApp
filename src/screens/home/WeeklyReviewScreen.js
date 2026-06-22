import { useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useWeeklyReport } from "../../hooks/useWeeklyReport";
import { SCREENS } from "../../constants/screens";
import { SubjectBreakdown } from "./components/SubjectBreakdown";
import { DailyHeatmap } from "./components/DailyHeatmap";

function StatTile({ icon, label, value, color, delta, C }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: RADIUS.xl, padding: SPACING.md, alignItems: "center", gap: 4, borderWidth: 1, borderColor: C.border }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: color + "18", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={16} color={color} />
      </View>
      <Text style={{ ...TYPOGRAPHY.stat, fontSize: 22, color }}>{value}</Text>
      <Text style={{ ...TYPOGRAPHY.micro, color, opacity: 0.7 }}>{label}</Text>
      {delta != null && delta !== 0 ? (
        <Text style={{ ...TYPOGRAPHY.micro, fontSize: 11, color: delta > 0 ? C.green : C.red }}>
          {delta > 0 ? "+" : ""}{delta}
        </Text>
      ) : null}
    </View>
  );
}

function DeltaChip({ value, label, C }) {
  const color = value > 0 ? C.green : value < 0 ? C.red : C.muted;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: color + "14", paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill }}>
      <Icon name={value >= 0 ? "trendUp" : "trendDown"} size={11} color={color} />
      <Text style={{ ...TYPOGRAPHY.captionMedium, color, fontSize: 11 }}>
        {value > 0 ? "+" : ""}{value} {label}
      </Text>
    </View>
  );
}

export default function WeeklyReviewScreen() {
  const C = useC();
  const navigation = useNavigation();
  const report = useWeeklyReport();
  const streak = useSelector((state) => state.studyLog.streak);

  const hours = Math.floor(report.totalMinutes / 60);
  const mins = report.totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours}s ${mins}dk` : `${mins}dk`;
  const netUp = parseFloat(report.netDelta) > 0;
  const netColor = netUp ? C.green : parseFloat(report.netDelta) < 0 ? C.red : C.muted;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={[s.backBtn, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Icon name="arrowL" size={20} color={C.text} />
        </Pressable>
        <Text style={{ ...TYPOGRAPHY.subheading, color: C.text }}>Haftalık Rapor</Text>
        <Pressable onPress={() => navigation.navigate(SCREENS.SHARE_CARD, { type: "weekly" })} hitSlop={12}>
          <Icon name="share" size={18} color={C.accent} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100)} style={[s.heroCard, { backgroundColor: C.accent + "10", borderColor: C.accent + "30" }]}>
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.accent, textTransform: "uppercase", letterSpacing: 0.5 }}>Bu Hafta</Text>
          <Text style={{ ...TYPOGRAPHY.stat, color: C.text, fontSize: 44, marginTop: 4 }}>{timeStr}</Text>
          <Text style={{ ...TYPOGRAPHY.caption, color: C.muted, marginTop: 4 }}>toplam çalışma süresi</Text>
          {report.hasPrev ? (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <DeltaChip value={report.questionsDelta} label="soru" C={C} />
              <DeltaChip value={report.minutesDelta} label="dk" C={C} />
            </View>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={s.grid}>
          <StatTile icon="hash" label="Soru" value={String(report.totalQuestions)} color={C.orange} C={C} />
          <StatTile icon="target" label="Deneme" value={String(report.trialCount)} color={C.blue} C={C} />
          <StatTile icon="calendar" label="Aktif Gün" value={`${report.activeDays}/7`} color={C.teal} C={C} />
          <StatTile icon="activity" label="Streak" value={`${streak}`} color={C.green} C={C} />
        </Animated.View>

        {report.hasPrev && (
          <Animated.View entering={FadeInDown.delay(300)} style={[s.netCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.sec }}>Ortalama Net</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ ...TYPOGRAPHY.statSmall, color: C.text }}>{report.weekNetAvg}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: netColor + "18", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                  <Icon name={netUp ? "trendUp" : "trendDown"} size={12} color={netColor} />
                  <Text style={{ ...TYPOGRAPHY.captionMedium, color: netColor }}>{netUp ? "+" : ""}{report.netDelta}</Text>
                </View>
              </View>
            </View>
            <Text style={{ ...TYPOGRAPHY.micro, color: C.muted, marginTop: 4 }}>Geçen haftaya göre</Text>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(350)}>
          <DailyHeatmap dailyHeatmap={report.dailyHeatmap} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <SubjectBreakdown subjects={report.subjects} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)} style={[s.motivCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={{ fontSize: 28 }}>{report.activeDays >= 5 ? "🔥" : report.activeDays >= 3 ? "💪" : "📚"}</Text>
          <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text, flex: 1 }}>
            {report.activeDays >= 5 ? "Müthiş bir hafta! Bu tempoyu koru." : report.activeDays >= 3 ? "Güzel gidiyorsun, biraz daha artır." : "Hedefine ulaşmak için daha fazla çalışmalısın!"}
          </Text>
        </Animated.View>

        <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [s.btn, { backgroundColor: C.accent }, pressed && { opacity: 0.9 }]}>
          <Text style={{ ...TYPOGRAPHY.button, color: "#FFFFFF", fontSize: 16 }}>Tamam</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  backBtn: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  scroll: { paddingHorizontal: SPACING.xl, paddingBottom: 40, gap: SPACING.md },
  heroCard: { width: "100%", alignItems: "center", paddingVertical: SPACING.xxl, borderRadius: RADIUS.xxl, borderWidth: 1 },
  grid: { flexDirection: "row", gap: SPACING.sm, width: "100%" },
  netCard: { width: "100%", borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1 },
  motivCard: { width: "100%", flexDirection: "row", alignItems: "center", gap: SPACING.md, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1 },
  btn: { borderRadius: RADIUS.xl, paddingVertical: SPACING.lg, alignItems: "center", ...SHADOWS.fab },
});
