import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../../../components/design";
import { GUTTER, STEP, SHAPE } from "../../../themes/tokens";

export function RouteCompanionSkeleton() {
  return (
    <View style={s.wrap}>
      {/* Companion Effort Card */}
      <View style={s.card}>
        <Skeleton width="30%" height={12} radius={SHAPE.chip / 4} />
        <Skeleton width="60%" height={20} radius={SHAPE.chip / 2} style={{ marginTop: STEP.s1 }} />

        {/* Chart area */}
        <View style={s.chart}>
          <View style={s.lineRow}>
            <Skeleton width={30} height={12} radius={SHAPE.chip / 4} />
            <Skeleton width="80%" height={28} radius={SHAPE.chip / 2} />
          </View>
          <View style={s.lineRow}>
            <Skeleton width={30} height={12} radius={SHAPE.chip / 4} />
            <Skeleton width="80%" height={28} radius={SHAPE.chip / 2} />
          </View>
        </View>

        {/* Note */}
        <Skeleton width="75%" height={12} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s2 }} />
      </View>

      {/* Friends list header */}
      <Skeleton width="45%" height={14} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s4, marginBottom: STEP.s2 }} />

      {/* Friend rows */}
      <View style={s.list}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={s.row}>
            <Skeleton width={40} height={40} radius={SHAPE.chip} />
            <View style={s.rowBody}>
              <Skeleton width="55%" height={15} radius={SHAPE.chip / 4} />
              <Skeleton width="35%" height={11} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s1 }} />
            </View>
            <Skeleton width={70} height={32} radius={SHAPE.chip} />
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2,
  },
  card: {
    padding: STEP.s3,
    borderRadius: SHAPE.card,
  },
  chart: {
    marginTop: STEP.s3,
    gap: STEP.s2,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  list: {
    gap: STEP.s2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: STEP.s2,
    borderRadius: SHAPE.cardTight,
    gap: STEP.s2,
  },
  rowBody: {
    flex: 1,
  },
});
