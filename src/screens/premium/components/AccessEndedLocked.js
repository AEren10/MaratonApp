import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { ACCESS_ENDED as A } from "../../../constants/accessEnded";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

// "KILITLENDI": girinti yuzeyi, kesik kenarlik, kilitli cipler.
export const AccessEndedLocked = React.memo(function AccessEndedLocked() {
  const C = useC();

  return (
    <View style={[styles.panel, { backgroundColor: C.void, borderColor: C.border }]}>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{A.lockedLabel}</Text>
      <View style={styles.chips}>
        {A.locked.map((name) => (
          <View key={name} style={[styles.chip, { backgroundColor: C.elev }]}>
            <Icon name="lock" size={11} color={C.text3} sw={1.8} />
            <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  panel: {
    marginTop: STEP.s3 + 6,
    paddingVertical: STEP.s2 + 5,
    paddingHorizontal: STEP.s3 - 1,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1, marginTop: STEP.s2 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    height: 32,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.chip,
  },
});
