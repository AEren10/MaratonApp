import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { formatNet } from "../../../lib/format";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Kayit satiri. Kilitli satirda net YOK: yerinde bos bir cubuk ve kilit.
// Sahte deger gosterilmez; kaydin kendisi (tarih, ad) gorunur kalir.
export const ProPreviewTrialRow = React.memo(function ProPreviewTrialRow({ row }) {
  const C = useC();

  return (
    <View style={[styles.row, { borderTopColor: C.line }]}>
      <Text style={[TYPOGRAPHY.label, styles.date, { color: C.text3 }]}>{row.date}</Text>
      <Text
        style={[TYPOGRAPHY.tableName, styles.name, { color: row.locked ? C.text3 : C.text }]}
        numberOfLines={1}
      >
        {row.name}
      </Text>
      {row.locked ? (
        <View style={styles.lockedValue}>
          <Icon name="lock" size={13} color={C.text4} sw={1.5} />
          <View style={[styles.ghost, { backgroundColor: C.elev }]} />
        </View>
      ) : (
        <Text style={[TYPOGRAPHY.topicName, styles.net, { color: C.text }]}>{formatNet(row.net)}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2 + 3,
    borderTopWidth: 1,
  },
  date: { width: 56, letterSpacing: 1.1 },
  name: { flex: 1, minWidth: 0 },
  lockedValue: { flexDirection: "row", alignItems: "center", gap: 6 },
  ghost: { width: 56, height: 13, borderRadius: 3 },
  net: { fontVariant: ["tabular-nums"] },
});
