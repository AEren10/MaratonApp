import { View, Text, StyleSheet } from "react-native";

import { StatBlock } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";

export function SummaryHero({ headline, totalQuestions, stopsToday, durationLabel, dateLabel }) {
  const C = useC();

  return (
    <View>
      <Text style={[TYPOGRAPHY.heading, { color: C.text, paddingHorizontal: GUTTER, maxWidth: 300 }]}>
        {headline}
      </Text>

      <View style={[styles.row, { borderColor: C.line }]}>
        <StatBlock
          size="hero"
          value={String(totalQuestions)}
          label={`SORU · ${dateLabel.split(" · ")[0]}`}
          style={styles.flex}
        />
        <View style={styles.side}>
          <StatBlock size="value" align="right" value={String(stopsToday)} label="DURAK" />
          <StatBlock size="value" align="right" value={durationLabel} label="SÜRE" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: STEP.s3,
    marginTop: STEP.s4,
    paddingHorizontal: GUTTER,
    paddingBottom: STEP.s3,
    borderBottomWidth: 1,
  },
  flex: { flex: 1 },
  side: { gap: STEP.s3 },
});
