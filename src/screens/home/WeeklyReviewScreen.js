import { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useWeeklyReport } from "../../hooks/useWeeklyReport";
import { SCREENS } from "../../constants/screens";

export default function WeeklyReviewScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const report = useWeeklyReport();
  const streak = useSelector((state) => state.studyLog.streak);

  const hours = Math.floor(report.totalMinutes / 60);
  const mins = report.totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours}s ${mins}dk` : `${mins}dk`;

  const netUp = parseFloat(report.netDelta) > 0;
  const netColor = netUp ? C.green : parseFloat(report.netDelta) < 0 ? C.red : C.muted;

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={s.backBtn}>
          <Icon name="arrowL" size={20} color={C.text} />
        </Pressable>
        <Text style={s.headerTitle}>Haftalık Rapor</Text>
        <Pressable onPress={() => navigation.navigate(SCREENS.SHARE_CARD, { type: "weekly" })} hitSlop={12}>
          <Icon name="share" size={18} color={C.amber} />
        </Pressable>
      </View>

      <View style={s.container}>
        {/* Hero stats */}
        <Animated.View entering={FadeInUp.delay(100)} style={s.heroCard}>
          <Text style={s.heroLabel}>Bu Hafta</Text>
          <Text style={s.heroValue}>{timeStr}</Text>
          <Text style={s.heroSub}>toplam çalışma süresi</Text>
        </Animated.View>

        {/* Stat grid */}
        <Animated.View entering={FadeInDown.delay(200)} style={s.grid}>
          <StatTile icon="hash" label="Soru" value={String(report.totalQuestions)} color={C.amber} C={C} />
          <StatTile icon="target" label="Deneme" value={String(report.trialCount)} color={C.blue} C={C} />
          <StatTile icon="calendar" label="Aktif Gün" value={`${report.activeDays}/7`} color={C.purple} C={C} />
          <StatTile icon="activity" label="Streak" value={`${streak}`} color={C.green} C={C} />
        </Animated.View>

        {/* Net change */}
        {report.hasPrev && (
          <Animated.View entering={FadeInDown.delay(300)} style={s.netCard}>
            <View style={s.netRow}>
              <Text style={s.netLabel}>Ortalama Net</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={[s.netValue, { color: C.text }]}>{report.weekNetAvg}</Text>
                <View style={[s.netBadge, { backgroundColor: netColor + "18" }]}>
                  <Icon name={netUp ? "trendUp" : "trendDown"} size={12} color={netColor} />
                  <Text style={{ ...TYPOGRAPHY.captionMedium, color: netColor }}>
                    {netUp ? "+" : ""}{report.netDelta}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={s.netSub}>Geçen haftaya göre</Text>
          </Animated.View>
        )}

        {/* Motivational message */}
        <Animated.View entering={FadeInDown.delay(400)} style={s.motivCard}>
          <Text style={s.motivEmoji}>{report.activeDays >= 5 ? "🔥" : report.activeDays >= 3 ? "💪" : "📚"}</Text>
          <Text style={s.motivText}>
            {report.activeDays >= 5
              ? "Müthiş bir hafta! Bu tempoyu koru."
              : report.activeDays >= 3
              ? "Güzel gidiyorsun, biraz daha artır."
              : "Hedefine ulaşmak için daha fazla çalışmalısın!"}
          </Text>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Animated.View entering={FadeInDown.delay(500)} style={{ width: "100%" }}>
          <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [s.btn, pressed && { opacity: 0.9 }]}>
            <Text style={s.btnText}>Tamam</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function StatTile({ icon, label, value, color, C }) {
  return (
    <View style={{
      flex: 1, backgroundColor: C.surface, borderRadius: RADIUS.xl,
      padding: SPACING.md, alignItems: "center", gap: 4,
      borderWidth: 1, borderColor: C.border,
    }}>
      <View style={{
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: color + "18", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={icon} size={16} color={color} />
      </View>
      <Text style={{ ...TYPOGRAPHY.stat, fontSize: 22, color: C.text }}>{value}</Text>
      <Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>{label}</Text>
    </View>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 12, backgroundColor: C.surface,
      alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border,
    },
    headerTitle: { ...TYPOGRAPHY.subheading, color: C.text },
    container: { flex: 1, alignItems: "center", paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxl },

    heroCard: {
      width: "100%", alignItems: "center", paddingVertical: SPACING.xxl,
      backgroundColor: C.amber + "10", borderRadius: RADIUS.xxl,
      borderWidth: 1, borderColor: C.amber + "30",
    },
    heroLabel: { ...TYPOGRAPHY.captionMedium, color: C.amber, textTransform: "uppercase", letterSpacing: 0.5 },
    heroValue: { ...TYPOGRAPHY.stat, color: C.text, fontSize: 44, marginTop: 4 },
    heroSub: { ...TYPOGRAPHY.caption, color: C.muted, marginTop: 4 },

    grid: { flexDirection: "row", gap: SPACING.sm, width: "100%", marginTop: SPACING.lg },

    netCard: {
      width: "100%", backgroundColor: C.surface, borderRadius: RADIUS.xl,
      padding: SPACING.lg, marginTop: SPACING.lg, borderWidth: 1, borderColor: C.border,
    },
    netRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    netLabel: { ...TYPOGRAPHY.bodyMedium, color: C.sec },
    netValue: { ...TYPOGRAPHY.statSmall },
    netBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    netSub: { ...TYPOGRAPHY.micro, color: C.muted, marginTop: 4 },

    motivCard: {
      width: "100%", flexDirection: "row", alignItems: "center", gap: SPACING.md,
      backgroundColor: C.surface, borderRadius: RADIUS.xl,
      padding: SPACING.lg, marginTop: SPACING.md,
      borderWidth: 1, borderColor: C.border,
    },
    motivEmoji: { fontSize: 28 },
    motivText: { ...TYPOGRAPHY.bodyMedium, color: C.text, flex: 1 },

    btn: {
      backgroundColor: C.amber, borderRadius: RADIUS.xl,
      paddingVertical: SPACING.lg, alignItems: "center", ...SHADOWS.amber,
    },
    btnText: { ...TYPOGRAPHY.button, color: "#FFFFFF", fontSize: 16 },
  });
}
