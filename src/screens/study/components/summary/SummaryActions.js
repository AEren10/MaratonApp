import { View, StyleSheet } from "react-native";

import { Button } from "../../../../components/design";
import { GUTTER, STEP } from "../../../../themes/tokens";

// Gun/Ay: birincil + "Kartı paylaş". Hafta: "Kartı gör" + Paylaş · İndir.
export function SummaryActions({ period, ctaLabel, onPrimary, onShare }) {
  if (period === "week") {
    return (
      <View style={styles.wrap}>
        <Button variant="primary" size="lg" fullWidth onPress={onShare}>Kartı gör</Button>
        <View style={styles.pair}>
          <Button variant="outline" size="lg" icon="share" onPress={onShare} style={styles.flex}>Paylaş</Button>
          <Button variant="outline" size="lg" icon="arrowDown" onPress={onShare} style={styles.flex}>İndir</Button>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.wrap}>
      <Button variant="primary" size="lg" fullWidth onPress={onPrimary}>{ctaLabel}</Button>
      <Button variant="outline" size="lg" fullWidth onPress={onShare} style={styles.gap}>Kartı paylaş</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s4, paddingBottom: STEP.s4 },
  pair: { flexDirection: "row", gap: STEP.s1, marginTop: STEP.s1 },
  gap: { marginTop: STEP.s1 },
  flex: { flex: 1 },
});
