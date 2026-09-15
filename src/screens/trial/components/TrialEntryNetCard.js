import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { formatNumber } from "../../../lib/format";
import { difficultyMeta } from "../trialDifficultyLevels";

export function TrialEntryNetCard({ totalNet, normalizedNet, difficultyLevel, publisherName, styles: shared }) {
  const C = useC();
  const meta = [publisherName, difficultyMeta(difficultyLevel).factor].filter(Boolean).join(" · ");
  return (
    <View style={shared.panel}>
      <View style={styles.top}>
        <Text style={shared.label}>HESAPLANAN NET</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{meta}</Text>
      </View>
      <View style={styles.bottom}>
        <Text style={[TYPOGRAPHY.stat, styles.value, { color: C.text }]}>{formatNumber(totalNet, 2)}</Text>
        <Text style={[TYPOGRAPHY.meta, styles.note, { color: C.text2 }]}>
          {
ormalize net ${formatNumber(normalizedNet, 2)} · rota bunu kullanır}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: STEP.s1 },
  bottom: { flexDirection: "row", alignItems: "baseline", gap: STEP.s2, marginTop: STEP.s2 },
  value: { lineHeight: 46 },
  note: { flex: 1 },
});
