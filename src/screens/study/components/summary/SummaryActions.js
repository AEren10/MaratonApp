import { View, StyleSheet } from "react-native";

import { Button } from "../../../../components/design";
import { GUTTER, STEP } from "../../../../themes/tokens";

// Gun/Ay: birincil + "Kartı paylaş" + "Ana sayfaya dön". Hafta: siradaki
// durak (rapordan dogrudan calismaya) + "Haftanı paylaş". Eskiden uc buton
// (Kartı gör / Paylaş / İndir) ayni isi yapiyordu.
export function SummaryActions({ period, ctaLabel, onPrimary, onShare, onGoHome, onStart, startLabel }) {
  if (period === "week") {
    return (
      <View style={styles.wrap}>
        {onStart ? <Button variant="primary" size="lg" fullWidth onPress={onStart}>{startLabel || "Sıradaki durağa başla"}</Button> : null}
        <Button variant="outline" size="lg" fullWidth icon="share" onPress={onShare} style={onStart ? styles.gap : null}>Haftanı paylaş</Button>
        {onGoHome ? (
          <Button variant="ghost" size="md" fullWidth onPress={onGoHome} style={styles.gap}>Ana sayfaya dön</Button>
        ) : null}
      </View>
    );
  }
  return (
    <View style={styles.wrap}>
      <Button variant="primary" size="lg" fullWidth onPress={onPrimary}>{ctaLabel}</Button>
      <Button variant="outline" size="lg" fullWidth onPress={onShare} style={styles.gap}>Kartı paylaş</Button>
      {onGoHome ? (
        <Button variant="ghost" size="md" fullWidth onPress={onGoHome} style={styles.gap}>Ana sayfaya dön</Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s4, paddingBottom: STEP.s4 },
  pair: { flexDirection: "row", gap: STEP.s1, marginTop: STEP.s1 },
  gap: { marginTop: STEP.s1 },
  flex: { flex: 1 },
});
