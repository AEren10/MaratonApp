import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Tasarim: her ozellik ust cizgiyle ayrilmis, yesil onay + ad + aciklama.
// Onay isareti C.up cunku "acilan" bir sey anlatiyor, durum degil.
export const ProFeatureItem = React.memo(function ProFeatureItem({ name, desc }) {
  const C = useC();

  return (
    <View style={[styles.row, { borderTopColor: C.line }]}>
      <View style={styles.icon}>
        <Icon name="check" size={16} color={C.up} sw={2} />
      </View>
      <View style={styles.body}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{name}</Text>
        <Text style={[TYPOGRAPHY.meta, styles.desc, { color: C.text3 }]}>{desc}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: STEP.s2,
    paddingVertical: STEP.s1 * 2,
    borderTopWidth: 1,
  },
  icon: { marginTop: 2 },
  body: { flex: 1, minWidth: 0 },
  desc: { marginTop: 5, lineHeight: 19 },
});
