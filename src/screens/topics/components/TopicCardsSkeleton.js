import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../../../components/design";
import { GUTTER, STEP, SHAPE } from "../../../themes/tokens";

export function TopicCardsSkeleton() {
  return (
    <View style={s.wrap}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={s.card}>
          <Skeleton width={44} height={44} radius={SHAPE.cardTight} />
          <View style={s.cardBody}>
            <Skeleton width="65%" height={16} radius={SHAPE.chip / 4} />
            <Skeleton width="40%" height={12} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s1 }} />
          </View>
          <View style={s.cardEnd}>
            <Skeleton width={42} height={20} radius={SHAPE.chip} />
            <Skeleton width={50} height={4} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s1 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2,
    gap: STEP.s2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: STEP.s3,
    borderRadius: SHAPE.card,
    gap: STEP.s2,
  },
  cardBody: {
    flex: 1,
  },
  cardEnd: {
    alignItems: "flex-end",
  },
});
