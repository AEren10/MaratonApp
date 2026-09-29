import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../../themes/tokens";

// Gunun / Haftalik / Ayin Ozeti (kanon): cumle + kahraman sayi + iki yan sayi.
export function SideStat({ stat, C, big = false }) {
  return (
    <View style={big ? null : styles.sideStat}>
      <Text style={[big ? TYPOGRAPHY.statPosterSide : TYPOGRAPHY.statSide, { color: C.text }]} allowFontScaling={false}>
        {stat.value}
        {stat.suffix ? <Text style={[TYPOGRAPHY.statSideUnit, { color: C.text3 }]}>{stat.suffix}</Text> : null}
      </Text>
      <Text style={[TYPOGRAPHY.tableHead, { color: C.text3, marginTop: STEP.s1 / 2 }]}>{stat.label}</Text>
    </View>
  );
}

export function PeriodHero({ eyebrow, headline, hero, side = [] }) {
  const C = useC();

  return (
    <View>
      {eyebrow || headline ? (
        <View style={styles.head}>
          {eyebrow ? <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>{eyebrow}</Text> : null}
          {headline ? (
            <Text style={[TYPOGRAPHY.heroSentence, { color: C.text, marginTop: eyebrow ? STEP.s2 : 0 }]}>
              {headline}
            </Text>
          ) : null}
        </View>
      ) : null}

      {hero ? (
        <View style={[styles.row, { borderColor: C.line }]}>
          <View style={styles.flex}>
            <Text style={[TYPOGRAPHY.statHeroTight, styles.heroValue, { color: C.text }]} allowFontScaling={false}>
              {hero.value}
            </Text>
            <Text style={[TYPOGRAPHY.label, { color: C.text2, marginTop: STEP.s1 }]}>{hero.label}</Text>
          </View>
          {side.length > 0 ? (
            <View style={styles.side}>
              {side.map((stat) => <SideStat key={stat.label} stat={stat} C={C} />)}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: GUTTER, maxWidth: 360 },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: STEP.s3,
    marginTop: STEP.s3,
    marginHorizontal: GUTTER,
    paddingBottom: STEP.s3,
    borderBottomWidth: 1,
  },
  heroValue: { includeFontPadding: false },
  flex: { flex: 1, minWidth: 0 },
  side: { gap: STEP.s2, alignItems: "flex-end", minWidth: 70 },
  sideStat: { alignItems: "flex-end" },
});
