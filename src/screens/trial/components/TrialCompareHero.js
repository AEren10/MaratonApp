import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Tasarim: eski deneme text3 ile soluk, yeni deneme tam kontrast,
// sagda fark. Fark artiysa `up`, dususte `down` (gri -- kotu haber bagirmaz).
export const TrialCompareHero = React.memo(function TrialCompareHero({
  C, olderLabel, olderNet, newerLabel, newerNet, diffLabel, diffUp,
}) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={[styles.eyebrow, { color: C.text3 }]}>{olderLabel}</Text>
        <Text style={[TYPOGRAPHY.statPair, styles.net, { color: C.text3 }]} allowFontScaling={false}>
          {olderNet}
        </Text>
      </View>

      <View style={[styles.arrow, { backgroundColor: C.text5 }]} />

      <View>
        <Text style={[styles.eyebrow, { color: C.accentBright }]}>{newerLabel}</Text>
        <Text style={[TYPOGRAPHY.statPair, styles.net, { color: C.text }]} allowFontScaling={false}>
          {newerNet}
        </Text>
      </View>

      <View style={styles.diff}>
        <Text
          style={[TYPOGRAPHY.bodySemiBold, { fontSize: 15, color: diffUp ? C.up : C.down }]}
          allowFontScaling={false}
        >
          {diffLabel}
        </Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 4 }]}>net</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s2 },
  eyebrow: { fontFamily: "Archivo_400", fontSize: 11, lineHeight: 15, letterSpacing: 1.54 },
  net: { marginTop: STEP.s1 },
  arrow: { width: 22, height: 1, marginBottom: 10 },
  diff: { flex: 1, alignItems: "flex-end" },
});
