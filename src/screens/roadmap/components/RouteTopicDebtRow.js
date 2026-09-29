import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { useTopicDebt } from "../../../hooks/useTopicDebt";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function RouteTopicDebtRow({ C, onPress }) {
  const { totalHours, stopCount, hasHours } = useTopicDebt();

  if (!hasHours || stopCount <= 0) return null;

  return (
    <View style={s.wrap}>
      <Press
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${totalHours} saat geride, ${stopCount} konu, borç dağıtımını aç`}
        style={({ pressed }) => [
          s.row,
          {
            backgroundColor: pressed ? C.elev : C.surface,
            borderColor: C.elev,
          },
        ]}
      >
        <View style={[s.dot, { backgroundColor: C.warn }]} />
        <View style={s.copy}>
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>
            {`${totalHours} sa geride · ${stopCount} konu`}
          </Text>
        </View>
        <Icon name="chevR" size={13} color={C.text3} />
      </Press>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: GUTTER,
    marginTop: STEP.s2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2 + STEP.s1 / 2,
    paddingHorizontal: STEP.s3,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: SHAPE.chip / 2,
  },
  copy: {
    flex: 1,
  },
});
