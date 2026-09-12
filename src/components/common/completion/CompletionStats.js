import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Tamamlama anlarinin uclu sayi seridi. Deger HESAPLANMIS olmali --
// arkasinda veri olmayan alan buraya hic gonderilmez (items filtrelenir).
export const CompletionStats = memo(function CompletionStats({ items = [] }) {
  const C = useC();
  const shown = items.filter((item) => item && item.value != null);
  if (!shown.length) return null;

  return (
    <View style={s.row}>
      {shown.map((item) => (
        <View key={item.label} style={[s.cell, { backgroundColor: C.void, borderColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]} numberOfLines={1}>
            {item.label}
          </Text>
          <Text
            style={[TYPOGRAPHY.statSmall, s.value, { color: C.text }]}
            allowFontScaling={false}
            numberOfLines={1}
          >
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: STEP.s1 + 2 },
  cell: {
    flex: 1,
    minWidth: 0,
    paddingVertical: STEP.s2,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
  },
  value: { marginTop: 7 },
});
