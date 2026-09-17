import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../../../components/design";
import { GUTTER, STEP, SHAPE } from "../../../themes/tokens";

export function QuickPracticeSkeleton() {
  return (
    <View style={s.wrap}>
      {/* Top bar */}
      <View style={s.topBar}>
        <Skeleton width={28} height={28} radius={SHAPE.chip} />
        <View style={s.dots}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={12} height={12} radius={SHAPE.chip / 2} />
          ))}
        </View>
        <Skeleton width={40} height={20} radius={SHAPE.chip / 2} />
      </View>

      {/* Question Card */}
      <View style={s.card}>
        {/* Chip + Topic */}
        <View style={s.chipRow}>
          <Skeleton width={80} height={24} radius={SHAPE.chip} />
          <Skeleton width="50%" height={16} radius={SHAPE.chip / 4} />
        </View>

        {/* Question Area */}
        <View style={s.questionArea}>
          <Skeleton width="100%" height={160} radius={SHAPE.cardTight} />
        </View>

        {/* Choice buttons (A, B, C, D, E) */}
        <View style={s.options}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={48} height={48} radius={SHAPE.chip} />
          ))}
        </View>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: STEP.s4,
  },
  dots: {
    flexDirection: "row",
    gap: STEP.s1,
  },
  card: {
    flex: 1,
    borderRadius: SHAPE.card,
    padding: STEP.s3,
    marginBottom: STEP.s4,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    marginBottom: STEP.s3,
  },
  questionArea: {
    flex: 1,
    justifyContent: "center",
    marginBottom: STEP.s3,
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: STEP.s2,
  },
});
