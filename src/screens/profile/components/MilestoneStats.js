import { View, Text, StyleSheet } from "react-native";

import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Tasarim: hero'nun altindaki uc kutu (SORU · SURE · NET).
// Verisi olmayan kutu hic basilmaz — sifir uydurulmaz.
export function MilestoneStats({ questions, hours, net }) {
  const C = useC();

  const items = [];
  if (questions) items.push({ key: "q", value: questions, label: "SORU" });
  if (hours) items.push({ key: "h", value: hours, label: "SÜRE" });
  if (net) {
    items.push({
      key: "n",
      value: net.text,
      label: "NET",
      // `up` YALNIZ artis icin. Dususte notr metin tonu kalir.
      color: net.delta > 0 ? C.up : C.text,
    });
  }

  if (!items.length) return null;

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <Card key={item.key} tone="surface" radius="panel" style={styles.card}>
          <Text
            style={[TYPOGRAPHY.statSmall, { color: item.color || C.text }]}
            allowFontScaling={false}
            numberOfLines={1}
          >
            {item.value}
          </Text>
          <Text style={[TYPOGRAPHY.label, styles.label, { color: C.text3 }]}>
            {item.label}
          </Text>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: STEP.s1 },
  card: { flex: 1, alignItems: "center" },
  label: { marginTop: 6 },
});
