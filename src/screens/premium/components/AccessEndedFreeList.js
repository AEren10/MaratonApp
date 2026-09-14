import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { ACCESS_ENDED as A } from "../../../constants/accessEnded";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// "UCRETSIZDE ACIK KALIR": ince cizgili liste, yesil tik.
export const AccessEndedFreeList = React.memo(function AccessEndedFreeList() {
  const C = useC();

  return (
    <View style={styles.wrap}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>{A.freeLabel}</Text>
      <View style={styles.list}>
        {A.free.map((line) => (
          <View key={line} style={[styles.row, { borderTopColor: C.line }]}>
            <Icon name="check" size={14} color={C.up} sw={2.2} />
            <Text style={[TYPOGRAPHY.captionMedium, styles.text, { color: C.text2 }]}>{line}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s4 },
  list: { marginTop: STEP.s2 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2, paddingVertical: STEP.s2 + 2, borderTopWidth: 1 },
  text: { flex: 1 },
});
