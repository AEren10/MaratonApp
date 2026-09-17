import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../../../components/design";
import { STEP, GUTTER, SHAPE } from "../../../themes/tokens";

export function TrialRecordsSkeleton() {
  return (
    <View style={s.wrap}>
      {/* Filter Tabs Skeleton */}
      <View style={s.tabs}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} width="22%" height={36} radius={SHAPE.chip} />
        ))}
      </View>

      {/* Month Section Header */}
      <Skeleton width="32%" height={12} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s4 }} />

      {/* Record Rows */}
      <View style={s.list}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={s.row}>
            <Skeleton width={44} height={44} radius={SHAPE.chip} />
            <View style={s.rowBody}>
              <Skeleton width="60%" height={15} radius={SHAPE.chip / 4} />
              <Skeleton width="35%" height={11} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s1 }} />
            </View>
            <Skeleton width={48} height={22} radius={SHAPE.chip / 2} />
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: STEP.s2,
  },
  list: {
    marginTop: STEP.s3,
    gap: STEP.s2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: STEP.s3,
    borderRadius: SHAPE.cardTight,
    gap: STEP.s3,
  },
  rowBody: {
    flex: 1,
  },
});
