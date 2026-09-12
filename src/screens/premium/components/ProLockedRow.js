import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Kilitli satir: ad okunur, degerin YERI bos bir cubukla temsil edilir.
// Sahte bir sayi gosterilmiyor — deger yok, yeri var.
export const ProLockedRow = React.memo(function ProLockedRow({ label, width }) {
  const C = useC();

  return (
    <View style={[styles.row, { borderTopColor: C.line }]}>
      <Icon name="lock" size={14} color={C.text4} sw={1.5} />
      <Text style={[TYPOGRAPHY.tableName, styles.label, { color: C.text2 }]}>{label}</Text>
      <View style={[styles.ghost, { width, backgroundColor: C.elev }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: STEP.s2,
    borderTopWidth: 1,
  },
  label: { flex: 1 },
  ghost: { height: 10, borderRadius: 2 },
});
