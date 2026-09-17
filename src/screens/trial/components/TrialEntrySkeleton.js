import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../../../components/design";
import { STEP, GUTTER, SHAPE } from "../../../themes/tokens";

export function TrialEntrySkeleton() {
  return (
    <View style={s.container}>
      {/* Top Header Placeholder */}
      <View style={s.header}>
        <Skeleton width={36} height={36} radius={SHAPE.chip} />
        <Skeleton width={80} height={24} radius={SHAPE.chip} />
      </View>

      {/* Title & Subtitle */}
      <View style={s.block}>
        <Skeleton width="55%" height={26} radius={SHAPE.chip} />
        <Skeleton width="80%" height={14} radius={SHAPE.chip / 2} style={{ marginTop: STEP.s2 }} />
      </View>

      {/* Input / Form Card Placeholder */}
      <View style={s.block}>
        <Skeleton width="100%" height={52} radius={SHAPE.panel} />
      </View>

      {/* Type Chips */}
      <View style={s.chipsRow}>
        <Skeleton width="30%" height={42} radius={SHAPE.chip} />
        <Skeleton width="30%" height={42} radius={SHAPE.chip} />
        <Skeleton width="30%" height={42} radius={SHAPE.chip} />
      </View>

      {/* Subject Input Card */}
      <View style={s.block}>
        <Skeleton width="100%" height={180} radius={SHAPE.card} />
      </View>

      {/* Bottom Button */}
      <View style={s.bottom}>
        <Skeleton width="100%" height={52} radius={SHAPE.panel} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: STEP.s2,
  },
  block: {
    marginTop: STEP.s4,
  },
  chipsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: STEP.s3,
  },
  bottom: {
    marginTop: "auto",
    paddingBottom: STEP.s4,
  },
});
