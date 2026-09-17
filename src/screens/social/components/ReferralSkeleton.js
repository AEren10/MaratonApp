import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../../../components/design";
import { GUTTER, STEP, SHAPE } from "../../../themes/tokens";

export function ReferralSkeleton() {
  return (
    <View style={s.wrap}>
      {/* Hero circle */}
      <View style={s.center}>
        <Skeleton width={72} height={72} radius={SHAPE.pill} />
        <Skeleton width="50%" height={22} radius={SHAPE.chip / 2} style={{ marginTop: STEP.s3 }} />
        <Skeleton width="75%" height={14} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s1 }} />
      </View>

      {/* Code Card */}
      <View style={s.card}>
        <Skeleton width="30%" height={12} radius={SHAPE.chip / 4} />
        <Skeleton width="60%" height={32} radius={SHAPE.chip / 2} style={{ marginVertical: STEP.s2 }} />
        <View style={s.codeActions}>
          <Skeleton width="48%" height={44} radius={SHAPE.button} />
          <Skeleton width="48%" height={44} radius={SHAPE.button} />
        </View>
      </View>

      {/* Stats Card */}
      <View style={s.statCard}>
        <Skeleton width={44} height={44} radius={SHAPE.chip} />
        <View style={s.statBody}>
          <Skeleton width="35%" height={22} radius={SHAPE.chip / 4} />
          <Skeleton width="55%" height={12} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s1 }} />
        </View>
        <Skeleton width={60} height={20} radius={SHAPE.chip / 2} />
      </View>

      {/* Input Card */}
      <View style={s.card}>
        <Skeleton width="45%" height={14} radius={SHAPE.chip / 4} />
        <View style={s.inputRow}>
          <Skeleton width="70%" height={44} radius={SHAPE.input} />
          <Skeleton width="25%" height={44} radius={SHAPE.button} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s3,
    gap: STEP.s3,
  },
  center: {
    alignItems: "center",
    paddingVertical: STEP.s2,
  },
  card: {
    padding: STEP.s3,
    borderRadius: SHAPE.card,
  },
  codeActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: STEP.s2,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: STEP.s3,
    borderRadius: SHAPE.card,
    gap: STEP.s3,
  },
  statBody: {
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: STEP.s2,
  },
});
