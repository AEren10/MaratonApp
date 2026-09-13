import { View, Text, StyleSheet } from "react-native";

import { Button, Card } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Defter ust karti: bugun tekrar gunu gelen soru sayisi + tekrar girisi.
// Sayi sifirsa kart hic basilmaz (cagiran karar verir).
export function ReviewDueCard({ count, onStart }) {
  const C = useC();
  return (
    <Card radius="sheet" style={[styles.card, { borderColor: C.elev }]}>
      <View style={styles.head}>
        <Text style={[TYPOGRAPHY.label, styles.flex, { color: C.text2 }]}>TEKRAR ZAMANI</Text>
        <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{count}</Text>
      </View>
      <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s1 }]}>
        Aralıklı tekrar: 1. gün, 3. gün, 7. gün. Bildiklerin uzar, bilemediklerin bir kademe geriler.
      </Text>
      <Button size="lg" fullWidth onPress={onStart} style={{ marginTop: STEP.s2 }}>
        {`Tekrara başla · ${count} soru`}
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: STEP.s3 - 2 },
  head: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  flex: { flex: 1 },
});
