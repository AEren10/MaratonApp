import { useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { Icon, Button } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useWeeklyTrialReport } from "../../hooks/useWeeklyTrialReport";
import { getTrialTypes, getAllSubjects } from "./trialTypes";
import { TypeBreakdown } from "./components/TypeBreakdown";
import { TrialDailyActivity } from "./components/TrialDailyActivity";
import { TrialSubjectBars } from "./components/TrialSubjectBars";

function StatTile({ icon, label, value, color, C }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: RADIUS.xl, padding: SPACING.md, alignItems: "center", gap: 4, borderWidth: 1, borderColor: C.border }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: color + "18", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={16} color={color} />
      </View>
      <Text style={{ ...TYPOGRAPHY.stat, fontSize: 22, color }}>{value}</Text>
      <Text style={{ ...TYPOGRAPHY.micro, color, opacity: 0.7 }}>{label}</Text>
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

export default function WeeklyTrialReviewScreen() {
  const C = useC();
  const navigation = useNavigation();
  const report = useWeeklyTrialReport();
  const delta = parseFloat(report.netDelta);
  const deltaColor = delta > 0 ? C.green : delta < 0 ? C.red : C.muted;

  const allSubjects = useMemo(() => getAllSubjects(C), [C]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={[s.backBtn, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Icon name="arrowL" size={20} color={C.text} />
        </Pressable>
        <Text style={{ ...TYPOGRAPHY.subheading, color: C.text }}>Haftalık Deneme</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100)} style={[s.heroCard, { backgroundColor: C.accent + "10", borderColor: C.accent + "30" }]}>
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.accent, textTransform: "uppercase", letterSpacing: 0.5 }}>Bu Hafta</Text>
          <Text style={{ ...TYPOGRAPHY.stat, color: C.text, fontSize: 44, marginTop: 4 }}>{report.avgNet}</Text>
          <Text style={{ ...TYPOGRAPHY.caption, color: C.muted, marginTop: 4 }}>ortalama net</Text>
          {report.hasPrev && delta !== 0 && (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <DeltaChip value={delta} label="net" C={C} />
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={s.grid}>
          <StatTile icon="target" label="Deneme" value={String(report.count)} color={C.blue} C={C} />
          <StatTile icon="trendUp" label="En İyi" value={report.bestNet} color={C.green} C={C} />
          <StatTile icon="check" label="Doğru" value={String(report.totalCorrect)} color={C.orange} C={C} />
          <StatTile icon="x" label="Yanlış" value={String(report.totalWrong)} color={C.red} C={C} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <TrialDailyActivity dailyActivity={report.dailyActivity} />
        </Animated.View>

        {report.types.length > 0 && (
          <Animated.View entering={FadeInDown.delay(350)}>
            <TypeBreakdown types={report.types} />
          </Animated.View>
        )}

        {report.subjects.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400)}>
            <TrialSubjectBars subjects={report.subjects} allSubjects={allSubjects} />
          </Animated.View>
        )}

        {report.bestTrial && (
          <Animated.View entering={FadeInDown.delay(450)} style={[s.bestCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={[s.bestIcon, { backgroundColor: C.green + "18" }]}>
              <Icon name="trophy" size={18} color={C.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text }}>
                {report.bestTrial.name || "En İyi Deneme"}
              </Text>
              <Text style={{ ...TYPOGRAPHY.caption, color: C.muted, marginTop: 2 }}>
                {report.bestNet} net · {report.bestTrial.date}
              </Text>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(500)} style={[s.motivCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={{ fontSize: 28 }}>
            {report.count >= 5 ? "🎯" : report.count >= 3 ? "📈" : "📝"}
          </Text>
          <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text, flex: 1 }}>
            {report.count >= 5
              ? "Harika tempo! Bu hafta çok deneme çözdün."
              : report.count >= 3
              ? "İyi gidiyorsun, biraz daha deneme çöz."
              : "Daha fazla deneme çözerek gelişimini hızlandır!"}
          </Text>
        </Animated.View>

        <Button onPress={() => navigation.goBack()} fullWidth>Tamam</Button>
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
  bestCard: { width: "100%", flexDirection: "row", alignItems: "center", gap: SPACING.md, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1 },
  bestIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  motivCard: { width: "100%", flexDirection: "row", alignItems: "center", gap: SPACING.md, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1 },
});
