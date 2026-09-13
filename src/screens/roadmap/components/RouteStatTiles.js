import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Esit genislikte sayi karolari (Durak Detayi: SON ÇALIŞMA · ÇÖZÜLEN · DEFTER).
// Degeri olmayan karo cizilmez — "0" ile "bilinmiyor" ayni sey degil.
export function RouteStatTiles({ tiles }) {
  const C = useC();
  const shown = tiles.filter((t) => t.value != null);
  if (!shown.length) return null;
  return (
    <View style={s.row}>
      {shown.map((tile) => (
        <View key={tile.label} style={[s.tile, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>{tile.label}</Text>
          <Text style={[TYPOGRAPHY.statMedium, s.value, { color: C.text }]}>{tile.value}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: STEP.s1, paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  tile: { flex: 1, padding: STEP.s2 + STEP.s1 / 2, borderRadius: SHAPE.panel, borderWidth: 1 },
  value: { marginTop: STEP.s1 / 2 },
});
