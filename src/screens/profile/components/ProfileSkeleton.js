import { StyleSheet, View } from "react-native";
import { Skeleton } from "../../../components/design";
import { STEP, SHAPE, GUTTER } from "../../../themes/tokens";

export function ProfileSkeleton() {
  const rows = Array.from({ length: 4 }, (_, i) => i);

  return (
    <View style={s.wrap}>
      {/* Hero */}
      <View style={s.hero}>
        <Skeleton width={160} height={26} radius={6} />
        <Skeleton width={100} height={16} radius={4} style={{ marginTop: STEP.s1 }} />
        <Skeleton width={80} height={28} radius={SHAPE.chip} style={{ marginTop: STEP.s2 }} />
      </View>

      {/* Target card */}
      <Skeleton width="100%" height={74} radius={SHAPE.panel} style={{ marginTop: STEP.s3 }} />

      {/* Credentials */}
      <View style={s.credRow}>
        <Skeleton width="30%" height={60} radius={SHAPE.cardTight} />
        <Skeleton width="30%" height={60} radius={SHAPE.cardTight} />
        <Skeleton width="30%" height={60} radius={SHAPE.cardTight} />
      </View>

      {/* Chart */}
      <Skeleton width="100%" height={150} radius={SHAPE.panel} style={{ marginTop: STEP.s3 }} />

      {/* Link rows */}
      <View style={{ gap: STEP.s2, marginTop: STEP.s3 }}>
        {rows.map((i) => (
          <Skeleton key={i} width="100%" height={48} radius={SHAPE.cardTight} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s2 },
  hero: { alignItems: "center", marginBottom: STEP.s2 },
  credRow: { flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s3 },
});
