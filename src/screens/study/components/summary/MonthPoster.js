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
        <Text style={[TYPOGRAPHY.posterNumber, styles.heroNumber, { color: C.text }]} allowFontScaling={false}>
          {heroValue}
        </Text>
        <View style={styles.heroLabel}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>NET</Text>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>ORTALAMASI</Text>
        </View>
      </View>

      <View style={[styles.strip, { borderColor: C.line, backgroundColor: C.surface + "26" }]}>
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
  wrap: { marginTop: STEP.s2 },
  pad: { paddingHorizontal: GUTTER },
  heroRow: { flexDirection: "row", alignItems: "flex-end", marginTop: STEP.s1 },
  heroNumber: { includeFontPadding: false },
  heroLabel: { paddingLeft: STEP.s2, paddingBottom: STEP.s2 },
  strip: { flexDirection: "row", marginTop: STEP.s3, borderTopWidth: 1, borderBottomWidth: 1 },
  cell: { flex: 1, paddingVertical: STEP.s2, paddingLeft: GUTTER, alignItems: "flex-start" },
});
