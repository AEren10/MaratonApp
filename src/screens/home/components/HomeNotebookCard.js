import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { alpha } from "../../../themes/colorMix";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

// "Defter" karti. Ana Sayfa'da guvenilir sayac kaynagi yok;
// sayi uydurulmaz, kart yalniz giris olarak kalir.
export function HomeNotebookCard({ onPress }) {
  const C = useC();
  return (
    <Pressable
      onPress={() => { H.tap(); onPress?.(); }}
      accessibilityRole="button"
      accessibilityLabel="Defter"
      style={({ pressed }) => [s.card, { backgroundColor: pressed ? C.elev : C.surface, borderColor: C.border }]}
    >
      <Icon name="notebook" size={20} color={alpha(C.accent, 55)} />
      <View style={s.flex}>
        <Text style={[TYPOGRAPHY.bodyMedium, s.title, { color: C.text }]}>Defter</Text>
      </View>
      <Icon name="chevR" size={12} color={C.text5} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2, padding: STEP.s3 - 2,
    borderRadius: SHAPE.card, borderWidth: 1,
  },
  flex: { flex: 1, minWidth: 0 },
  title: { fontSize: TYPOGRAPHY.bodyMedium.fontSize + 0.5 },
});
