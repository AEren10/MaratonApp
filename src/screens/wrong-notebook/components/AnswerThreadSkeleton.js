import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../../../components/design";
import { STEP, SHAPE } from "../../../themes/tokens";

export function AnswerThreadSkeleton() {
  return (
    <View style={s.list}>
      {[0, 1].map((i) => (
        <View key={i} style={s.row}>
          <Skeleton width={28} height={28} radius={SHAPE.pill} />
          <View style={s.body}>
            <View style={s.head}>
              <Skeleton width="40%" height={14} radius={SHAPE.chip / 4} />
              <Skeleton width="25%" height={11} radius={SHAPE.chip / 4} />
            </View>
            <Skeleton width="90%" height={14} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s1 }} />
            <Skeleton width="60%" height={14} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s1 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  list: {
    gap: STEP.s3,
    paddingVertical: STEP.s2,
  },
  row: {
    flexDirection: "row",
    gap: STEP.s2,
  },
  body: {
    flex: 1,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
