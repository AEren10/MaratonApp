import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../../../components/design";
import { GUTTER, STEP, SHAPE } from "../../../themes/tokens";

export function SwipeReviewSkeleton() {
  return (
    <View style={s.wrap}>
      {/* Header */}
      <View style={s.header}>
        <Skeleton width={32} height={32} radius={SHAPE.chip} />
        <Skeleton width="40%" height={20} radius={SHAPE.chip / 2} />
        <Skeleton width={40} height={16} radius={SHAPE.chip / 2} />
      </View>

      {/* Progress Bar */}
      <View style={s.progressWrap}>
        <Skeleton width="100%" height={4} radius={SHAPE.chip / 4} />
      </View>

      {/* Hint Row */}
      <View style={s.hintRow}>
        <Skeleton width={80} height={14} radius={SHAPE.chip / 4} />
        <Skeleton width={80} height={14} radius={SHAPE.chip / 4} />
      </View>

      {/* Big Card */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Skeleton width={90} height={26} radius={SHAPE.chip} />
          <Skeleton width="70%" height={18} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s2 }} />
        </View>

        <View style={s.cardBody}>
          <Skeleton width="100%" height={180} radius={SHAPE.cardTight} />
        </View>

        <View style={s.cardFooter}>
          <Skeleton width="45%" height={28} radius={SHAPE.chip} />
        </View>
      </View>

      {/* Tap Actions */}
      <View style={s.tapRow}>
        <Skeleton width="48%" height={50} radius={SHAPE.button} />
        <Skeleton width="48%" height={50} radius={SHAPE.button} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: GUTTER,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: STEP.s3,
  },
  progressWrap: {
    paddingVertical: STEP.s1,
  },
  hintRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: STEP.s2,
  },
  card: {
    flex: 1,
    padding: STEP.s3,
    borderRadius: SHAPE.card,
    marginVertical: STEP.s2,
  },
  cardHeader: {
    marginBottom: STEP.s3,
  },
  cardBody: {
    flex: 1,
    justifyContent: "center",
  },
  cardFooter: {
    marginTop: STEP.s3,
    alignItems: "center",
  },
  tapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: STEP.s3,
  },
});
