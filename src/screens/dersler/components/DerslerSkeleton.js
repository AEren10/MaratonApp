import { StyleSheet, View } from "react-native";
import { Skeleton } from "../../../components/design";
import { STEP, SHAPE } from "../../../themes/tokens";

export function DerslerSkeleton() {
  const days = Array.from({ length: 7 }, (_, i) => i);
  const rows = Array.from({ length: 3 }, (_, i) => i);

  return (
    <View style={s.wrap}>
      {/* WeekProgressCard skeleton */}
      <View style={s.progressCard}>
        <View style={s.rowBetween}>
          <Skeleton width={110} height={16} radius={4} />
          <Skeleton width={70} height={16} radius={4} />
        </View>
        <Skeleton width={80} height={48} radius={8} style={{ marginTop: STEP.s2 }} />
        <Skeleton width="100%" height={6} radius={3} style={{ marginTop: STEP.s3 }} />
        <View style={[s.rowBetween, { marginTop: STEP.s2 }]}>
          <Skeleton width={90} height={14} radius={4} />
          <Skeleton width={90} height={14} radius={4} />
        </View>
      </View>

      {/* WeekDayStrip skeleton */}
      <View style={s.dayStrip}>
        {days.map((i) => (
          <Skeleton key={i} width={38} height={46} radius={SHAPE.chip + 2} />
        ))}
      </View>

      {/* SelectedDayPanel skeleton */}
      <View style={s.panel}>
        <View style={s.rowBetween}>
          <Skeleton width={120} height={16} radius={4} />
          <Skeleton width={80} height={14} radius={4} />
        </View>
        <View style={{ gap: STEP.s2, marginTop: STEP.s3 }}>
          {rows.map((i) => (
            <View key={i} style={s.stopRow}>
              <Skeleton width={8} height={8} radius={4} />
              <View style={{ flex: 1, gap: 4 }}>
                <Skeleton width="70%" height={16} radius={4} />
                <Skeleton width="40%" height={12} radius={3} />
              </View>
              <Skeleton width={50} height={14} radius={4} />
            </View>
          ))}
        </View>
        <Skeleton width="100%" height={50} radius={SHAPE.cardTight} style={{ marginTop: STEP.s3 }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: STEP.s3, marginTop: STEP.s2 },
  progressCard: { padding: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1, borderColor: "transparent" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dayStrip: { flexDirection: "row", justifyContent: "space-between", paddingVertical: STEP.s2 },
  panel: { padding: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1, borderColor: "transparent" },
  stopRow: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
});
