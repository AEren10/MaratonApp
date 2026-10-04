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
        style={({ pressed }) => [s.row, { borderColor: C.line, opacity: pressed ? 0.7 : 1 }]}
      >
        <View style={[s.dot, { backgroundColor: C.text3 }]} />
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
    // Kutusuz satir: ust/alt ince cizgi (Rota sayfasi kutu kalabaligi, 4 Ekim).
    paddingVertical: STEP.s2 + STEP.s1 / 2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
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
