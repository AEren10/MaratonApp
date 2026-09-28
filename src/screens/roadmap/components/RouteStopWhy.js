import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// "NEDEN BU DURAK": rota motorunun duraga yazdigi gerekce + gercek
// ihmal suresi. Kaynagi olmayan madde yazilmaz; hic madde yoksa kart yok.
export function RouteStopWhy({ stop, color }) {
  const C = useC();
  const reason = stop.insight?.reasonText || null;
  const neglected = Number(stop.q) > 0 && Number(stop.neglectedDays) > 0 ? Math.round(stop.neglectedDays) : null;
  const items = [
    reason ? { key: "reason", text: reason, color } : null,
    neglected ? { key: "neglect", text: `Bu konuya son ${neglected} gündür çalışmadın.`, color: C.accent } : null,
  ].filter(Boolean);
  if (!items.length) return null;

  return (
    <View style={s.pad}>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>NEDEN BU DURAK</Text>
        <View style={s.list}>
          {items.map((item) => (
            <View key={item.key} style={s.item}>
              <View style={[s.bullet, { backgroundColor: item.color }]} />
              <Text style={[TYPOGRAPHY.tableName, s.text, { color: C.text2 }]}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  pad: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  card: { padding: STEP.s3, borderRadius: SHAPE.sheet, borderWidth: 1 },
  list: { marginTop: STEP.s2, gap: STEP.s2 },
  item: { flexDirection: "row", gap: STEP.s2 },
  bullet: { width: 6, height: 6, borderRadius: SHAPE.chip / 6, marginTop: STEP.s1 - 1 },
  text: { flex: 1 },
});
