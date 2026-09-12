import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

// Tasarim: secili plan yuzey tonu + kizil kenarlikla one cikar (golge yok).
// Radio yok; secim kartin kendisiyle anlatiliyor.
export const ProPlanRow = React.memo(function ProPlanRow({ plan, selected, onSelect }) {
  const C = useC();

  const press = useCallback(() => {
    H.select();
    onSelect(plan.id);
  }, [onSelect, plan.id]);

  return (
    <Pressable
      onPress={press}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[
        styles.row,
        {
          backgroundColor: selected ? C.surface : "transparent",
          borderColor: selected ? C.accent : C.border,
        },
      ]}
    >
      <View style={styles.left}>
        <View style={styles.nameRow}>
          <Text style={[TYPOGRAPHY.topicName, { color: C.text }]}>{plan.name}</Text>
          {plan.badge ? (
            <View style={[styles.badge, { backgroundColor: C.accent }]}>
              <Text style={[TYPOGRAPHY.tableHead, { color: C.accentInk }]}>{plan.badge}</Text>
            </View>
          ) : null}
        </View>
        {plan.sub ? (
          <Text style={[TYPOGRAPHY.meta, styles.sub, { color: C.text3 }]}>{plan.sub}</Text>
        ) : null}
      </View>
      <View style={styles.right}>
        <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{plan.price}</Text>
        <Text style={[TYPOGRAPHY.micro, styles.per, { color: C.text3 }]}>{plan.per}</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1 * 2,
    paddingVertical: STEP.s3,
    paddingHorizontal: STEP.s3,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
  },
  left: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  badge: { height: 20, paddingHorizontal: 9, borderRadius: SHAPE.chip, justifyContent: "center" },
  sub: { marginTop: 5 },
  right: { alignItems: "flex-end" },
  per: { marginTop: 2 },
});
