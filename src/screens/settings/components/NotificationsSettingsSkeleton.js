import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../../../components/design";
import { GUTTER, STEP, SHAPE } from "../../../themes/tokens";

export function NotificationsSettingsSkeleton() {
  return (
    <View style={s.wrap}>
      {/* Header */}
      <View style={s.header}>
        <Skeleton width={32} height={32} radius={SHAPE.chip} />
        <Skeleton width="45%" height={22} radius={SHAPE.chip / 2} />
      </View>

      {/* Groups */}
      {[0, 1, 2].map((g) => (
        <View key={g} style={s.group}>
          <Skeleton width="35%" height={12} radius={SHAPE.chip / 4} style={{ marginBottom: STEP.s2 }} />
          <View style={s.groupCard}>
            <View style={s.row}>
              <View style={s.rowText}>
                <Skeleton width="60%" height={15} radius={SHAPE.chip / 4} />
                <Skeleton width="40%" height={11} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s1 }} />
              </View>
              <Skeleton width={44} height={26} radius={SHAPE.pill} />
            </View>
            <View style={s.row}>
              <View style={s.rowText}>
                <Skeleton width="50%" height={15} radius={SHAPE.chip / 4} />
                <Skeleton width="30%" height={11} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s1 }} />
              </View>
              <Skeleton width={44} height={26} radius={SHAPE.pill} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s3,
    paddingVertical: STEP.s2,
    marginBottom: STEP.s3,
  },
  group: {
    marginBottom: STEP.s4,
  },
  groupCard: {
    padding: STEP.s3,
    borderRadius: SHAPE.card,
    gap: STEP.s3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowText: {
    flex: 1,
  },
});
