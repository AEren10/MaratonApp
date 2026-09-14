import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../../themes/tokens";
import { SideStat } from "./PeriodHero";

// Ayin Ozeti · tipografik hal: ay adi, dev net, altta ucu cizgili sayi seridi.
export function MonthPoster({ eyebrow, monthName, heroValue, stats = [] }) {
  const C = useC();

  return (
    <View style={styles.wrap}>
      <Text style={[TYPOGRAPHY.label, styles.pad, { color: C.accentBright }]}>{eyebrow}</Text>
      <Text style={[TYPOGRAPHY.posterWord, styles.pad, { color: C.text, marginTop: STEP.s2 }]} allowFontScaling={false}>
        {monthName}
      </Text>
      <View style={[styles.pad, styles.heroRow]}>
        <Text style={[TYPOGRAPHY.posterNumber, { color: C.text }]} allowFontScaling={false}>{heroValue}</Text>
        <View style={styles.heroLabel}>
          <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>NET</Text>
          <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>ORTALAMASI</Text>
        </View>
      </View>

      <View style={[styles.strip, { borderColor: C.line }]}>
        {stats.map((stat, i) => (
          <View key={stat.label} style={[styles.cell, i > 0 && { borderLeftWidth: 1, borderColor: C.line }]}>
            <SideStat stat={stat} C={C} big />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s3 },
  pad: { paddingHorizontal: GUTTER },
  heroRow: { flexDirection: "row", alignItems: "flex-end", marginTop: STEP.s2 },
  heroLabel: { paddingLeft: STEP.s3, paddingBottom: STEP.s3 },
  strip: { flexDirection: "row", marginTop: STEP.s3, borderTopWidth: 1, borderBottomWidth: 1 },
  cell: { flex: 1, paddingVertical: STEP.s3, paddingLeft: GUTTER, alignItems: "flex-start" },
});
