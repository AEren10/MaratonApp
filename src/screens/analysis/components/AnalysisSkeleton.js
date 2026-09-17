import { StyleSheet, View } from "react-native";
import { Skeleton } from "../../../components/design";
import { STEP, SHAPE } from "../../../themes/tokens";

export function AnalysisSkeleton() {
  const pills = Array.from({ length: 4 }, (_, i) => i);
  const bars = Array.from({ length: 5 }, (_, i) => i);

  return (
    <View style={s.wrap}>
      {/* Filter pills */}
      <View style={s.pillRow}>
        {pills.map((i) => (
          <Skeleton key={i} width={64} height={32} radius={SHAPE.chip} />
        ))}
      </View>

      {/* Insights card */}
      <Skeleton width="100%" height={72} radius={SHAPE.panel} style={{ marginTop: STEP.s2 }} />

      {/* Hero score card */}
      <View style={s.heroCard}>
        <View style={s.rowBetween}>
          <Skeleton width={110} height={14} radius={4} />
          <Skeleton width={70} height={14} radius={4} />
        </View>
        <Skeleton width={120} height={64} radius={8} style={{ marginTop: STEP.s2 }} />
        <Skeleton width="100%" height={90} radius={8} style={{ marginTop: STEP.s3 }} />
      </View>

      {/* Subject trends */}
      <View style={s.trendSection}>
        <Skeleton width={130} height={16} radius={4} style={{ marginBottom: STEP.s2 }} />
        <View style={s.barGrid}>
          {bars.map((i) => (
            <View key={i} style={s.barWrap}>
              <Skeleton width="100%" height={96} radius={SHAPE.cardTight} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: STEP.s3, marginTop: STEP.s2 },
  pillRow: { flexDirection: "row", gap: STEP.s2 },
  heroCard: { padding: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1, borderColor: "transparent" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  trendSection: { marginTop: STEP.s2 },
  barGrid: { flexDirection: "row", gap: STEP.s2 },
  barWrap: { flex: 1 },
});
