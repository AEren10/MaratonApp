import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../../../components/design";
import { GUTTER, STEP, SHAPE } from "../../../themes/tokens";

export function GroupsSkeleton() {
  return (
    <View style={s.wrap}>
      {/* Top action buttons */}
      <View style={s.actions}>
        <Skeleton width="48%" height={44} radius={SHAPE.button} />
        <Skeleton width="48%" height={44} radius={SHAPE.button} />
      </View>

      {/* Group chips */}
      <View style={s.chipsRow}>
        <Skeleton width={90} height={32} radius={SHAPE.pill} />
        <Skeleton width={110} height={32} radius={SHAPE.pill} />
        <Skeleton width={80} height={32} radius={SHAPE.pill} />
      </View>

      {/* Group info card */}
      <View style={s.infoCard}>
        <View style={s.infoBody}>
          <Skeleton width="50%" height={18} radius={SHAPE.chip / 4} />
          <Skeleton width="30%" height={12} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s1 }} />
        </View>
        <Skeleton width={80} height={32} radius={SHAPE.chip} />
      </View>

      {/* Member rows */}
      <View style={s.membersList}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={s.memberRow}>
            <Skeleton width={24} height={20} radius={SHAPE.chip / 4} />
            <Skeleton width={40} height={40} radius={SHAPE.chip} />
            <View style={s.memberName}>
              <Skeleton width="60%" height={15} radius={SHAPE.chip / 4} />
              <Skeleton width="35%" height={11} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s1 }} />
            </View>
            <Skeleton width={52} height={24} radius={SHAPE.chip / 2} />
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
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: STEP.s3,
  },
  chipsRow: {
    flexDirection: "row",
    gap: STEP.s2,
    marginBottom: STEP.s3,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: STEP.s3,
    borderRadius: SHAPE.cardTight,
    marginBottom: STEP.s3,
  },
  infoBody: {
    flex: 1,
  },
  membersList: {
    gap: STEP.s2,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: STEP.s2,
    borderRadius: SHAPE.cardTight,
    gap: STEP.s2,
  },
  memberName: {
    flex: 1,
  },
});
