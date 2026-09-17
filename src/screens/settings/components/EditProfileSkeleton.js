import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../../../components/design";
import { GUTTER, STEP, SHAPE } from "../../../themes/tokens";

export function EditProfileSkeleton() {
  return (
    <View style={s.wrap}>
      {/* Header */}
      <View style={s.header}>
        <Skeleton width={32} height={32} radius={SHAPE.chip} />
        <Skeleton width={60} height={20} radius={SHAPE.chip / 2} />
      </View>

      {/* Avatar */}
      <View style={s.avatarSection}>
        <Skeleton width={72} height={72} radius={SHAPE.pill} />
        <Skeleton width={110} height={14} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s2 }} />
      </View>

      {/* Form Fields */}
      <View style={s.form}>
        {/* Name input */}
        <View style={s.field}>
          <Skeleton width="25%" height={12} radius={SHAPE.chip / 4} />
          <Skeleton width="100%" height={48} radius={SHAPE.input} style={{ marginTop: STEP.s1 }} />
        </View>

        {/* Rows */}
        <View style={s.card}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={s.row}>
              <View style={s.rowBody}>
                <Skeleton width="50%" height={15} radius={SHAPE.chip / 4} />
                <Skeleton width="30%" height={11} radius={SHAPE.chip / 4} style={{ marginTop: STEP.s1 }} />
              </View>
              <Skeleton width={24} height={24} radius={SHAPE.chip / 2} />
            </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: STEP.s2,
    marginBottom: STEP.s4,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: STEP.s4,
  },
  form: {
    gap: STEP.s4,
  },
  field: {},
  card: {
    padding: STEP.s3,
    borderRadius: SHAPE.card,
    gap: STEP.s3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowBody: {
    flex: 1,
  },
});
