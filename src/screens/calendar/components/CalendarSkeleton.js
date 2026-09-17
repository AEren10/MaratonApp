import { StyleSheet, View } from "react-native";
import { Skeleton } from "../../../components/design";
import { STEP, SHAPE } from "../../../themes/tokens";

export function CalendarSkeleton() {
  const gridCells = Array.from({ length: 28 }, (_, i) => i);

  return (
    <View style={s.wrap}>
      <View style={s.monthRow}>
        <Skeleton width={32} height={32} radius={SHAPE.chip} />
        <Skeleton width={130} height={20} radius={6} />
        <Skeleton width={32} height={32} radius={SHAPE.chip} />
      </View>

      <View style={s.hero}>
        <Skeleton width={96} height={80} radius={12} />
        <Skeleton width={140} height={18} radius={6} style={{ marginTop: STEP.s2 }} />
        <Skeleton width={100} height={24} radius={12} style={{ marginTop: STEP.s2 }} />
      </View>

      <View style={s.grid}>
        {gridCells.map((i) => (
          <View key={i} style={s.cellWrap}>
            <Skeleton width="100%" height={38} radius={13} />
          </View>
        ))}
      </View>

      <View style={s.legend}>
        <Skeleton width={70} height={14} radius={4} />
        <Skeleton width={70} height={14} radius={4} />
        <Skeleton width={70} height={14} radius={4} />
      </View>

      <Skeleton width="100%" height={120} radius={SHAPE.sheet} style={{ marginTop: STEP.s3 }} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingTop: STEP.s2 },
  monthRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: STEP.s3 },
  hero: { alignItems: "center", marginBottom: STEP.s4 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -2 },
  cellWrap: { width: "14.28%", padding: 2.5 },
  legend: { flexDirection: "row", gap: STEP.s3, marginTop: STEP.s3 },
});
