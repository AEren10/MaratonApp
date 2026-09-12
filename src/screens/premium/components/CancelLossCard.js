import { View, Text, StyleSheet } from "react-native";

import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Tasarim: "14 EYLUL'DE DURUR" + kaybedilecek dort satir.
// Isaretler `down` grisiyle ciziliyor -- kotu haber kirmiziyla bagirmiyor.
const LOSSES = [
  "Rota · bugünün durakları ve rotanın tamamı",
  "Tahmin ve güven bandı · tempo senaryoları",
  "Konu ilerlemesi ve öncelikli konular",
  "Sınırsız deneme kaydı · ücretsizde ayda 4",
];

export function CancelLossCard({ dateLabel }) {
  const C = useC();

  return (
    <Card tone="surface" radius="sheet" style={{ borderColor: C.elev }}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>
        {`${dateLabel} DURUR`}
      </Text>
      <View style={styles.list}>
        {LOSSES.map((line) => (
          <View key={line} style={styles.item}>
            <View style={[styles.dot, { backgroundColor: C.down }]} />
            <Text style={[TYPOGRAPHY.caption, { color: C.text2, flex: 1 }]}>{line}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: 11, marginTop: STEP.s2 + 2 },
  item: { flexDirection: "row", gap: 11 },
  dot: { width: 5, height: 5, marginTop: 7, borderRadius: 1 },
});
