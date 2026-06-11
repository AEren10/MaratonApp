import { useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";

import { useSelector } from "react-redux";
import { Icon, Chip } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { selectTrials } from "../../store/slices/trialSlice";
import { SUBJECTS } from "./trialSubjects";

function ScoreRing({ size = 140, stroke = 10, net, max = 120 }) {
  const pct = Math.min(net / max, 1);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const color = pct >= 0.7 ? C.green : pct >= 0.5 ? C.amber : C.red;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>{net}</Text>
      <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>/ {max}</Text>
    </View>
  );
}

function SubjectRow({ name, color, net, max }) {
  const pct = max > 0 ? net / max : 0;
  return (
    <View style={styles.subjRow}>
      <View style={[styles.subjDot, { backgroundColor: color }]} />
      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]}>{name}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[TYPOGRAPHY.statSmall, { color, minWidth: 50, textAlign: "right" }]}>
        {net}
      </Text>
      <Text style={[TYPOGRAPHY.caption, { color: C.muted }]}>/ {max}</Text>
    </View>
  );
}

export default function TrialDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const trials = useSelector(selectTrials);

  const trial = route.params?.trial;
  const sorted = [...trials].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = trial || sorted[0];
  const prev = sorted.find((t) => t !== latest && new Date(t.date) < new Date(latest?.date));

  const net = latest?.totalNet || 0;
  const trend = prev ? net - (prev.totalNet || 0) : 0;
  const trendColor = trend > 0 ? C.green : trend < 0 ? C.red : C.muted;
  const dateStr = latest?.date
    ? new Date(latest.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  const bars = SUBJECTS.map((s) => ({
    name: s.name,
    c: s.color,
    net: latest?.subjects?.[s.key]?.net || 0,
    max: s.max,
  }));
  const history = sorted.slice(0, 6).map((t, i) => {
    const prevT = sorted[i + 1];
    return {
      date: new Date(t.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
      net: t.totalNet || 0,
      trend: prevT ? (t.totalNet || 0) - (prevT.totalNet || 0) : 0,
    };
  });

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>
          Deneme Detayi
        </Text>
        <Chip color={C.surface2}>{dateStr}</Chip>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <ScoreRing net={net} />
          <View style={styles.trendBadge}>
            <Icon name={trend >= 0 ? "trendUp" : "trendDown"} size={14} color={trendColor} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: trendColor }]}>
              {trend > 0 ? "+" : ""}{trend} net
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>
            DERS BAZLI SONUCLAR
          </Text>
          {bars.map((b) => (
            <SubjectRow key={b.name} name={b.name} color={b.c} net={b.net} max={b.max} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>
            GECMIS DENEMELER
          </Text>
          {history.map((h, i) => (
            <View key={i} style={styles.histRow}>
              <Text style={[TYPOGRAPHY.captionMedium, { color: C.sec, width: 60 }]}>{h.date}</Text>
              <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text, flex: 1 }]}>{h.net} net</Text>
              {h.trend !== 0 && (
                <View style={[styles.miniTrend, { backgroundColor: (h.trend > 0 ? C.green : C.red) + "20" }]}>
                  <Icon name={h.trend > 0 ? "trendUp" : "trendDown"} size={12} color={h.trend > 0 ? C.green : C.red} />
                  <Text style={[TYPOGRAPHY.micro, { color: h.trend > 0 ? C.green : C.red }]}>
                    {h.trend > 0 ? "+" : ""}{h.trend}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },
  scoreCard: {
    alignItems: "center", paddingVertical: SPACING.xxxl,
    backgroundColor: C.surface, borderRadius: RADIUS.xxl,
    marginBottom: SPACING.xxl,
  },
  trendBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    marginTop: SPACING.md, backgroundColor: C.surface2,
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
  },
  section: { marginBottom: SPACING.xxl },
  subjRow: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  subjDot: { width: 8, height: 8, borderRadius: 4 },
  barBg: {
    width: 60, height: 6, borderRadius: 3, backgroundColor: C.surface2, overflow: "hidden",
  },
  barFill: { height: 6, borderRadius: 3 },
  histRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  miniTrend: {
    flexDirection: "row", alignItems: "center", gap: 2,
    borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3,
  },
});
