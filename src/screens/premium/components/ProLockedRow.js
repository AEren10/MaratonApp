import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

// Kilitli satir: ad okunur, degerin YERI bos bir cubukla temsil edilir.
// Sahte bir sayi gosterilmiyor — deger yok, yeri var.
// boxed: onizleme varyantlarindaki cerceveli kilitli adim (uygula, karsilastir).
export const ProLockedRow = React.memo(function ProLockedRow({ label, width, boxed = false }) {
  const C = useC();

  return (
    <View style={boxed ? [styles.row, styles.box, { borderColor: C.elev }] : [styles.row, { borderTopColor: C.line }]}>
      <Icon name="lock" size={14} color={C.text4} sw={1.5} />
      <Text
        style={[boxed ? TYPOGRAPHY.meta : TYPOGRAPHY.tableName, styles.label, { color: boxed ? C.text3 : C.text2 }]}
      >
        {label}
      </Text>
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
  box: { borderTopWidth: 1, borderWidth: 1, borderRadius: SHAPE.panel, paddingHorizontal: STEP.s2 + 6 },
  label: { flex: 1 },
  ghost: { height: 10, borderRadius: 2 },
});
