import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { Button } from "../../../components/design/Button";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Bos grup ekrani bir aciklama + iki net aksiyon. Grubun ne ise yaradigini
// bilmeyen kullaniciya "kur" demek yetmiyordu.
const POINTS = [
  { n: "1", title: "Haftalık soru yarışı", sub: "Kim kaç soru çözdü; her hafta sıfırdan." },
  { n: "2", title: "Grup serisi", sub: "Grupta herkes çalıştıkça seri uzar." },
  { n: "3", title: "Netler gizli", sub: "Kıyas emek üzerinden; deneme sonuçların sende kalır." },
];

export function GroupsEmpty({ onCreate, onJoin }) {
  const C = useC();
  return (
    <View style={s.wrap}>
      <View style={[s.panel, { backgroundColor: C.surface, borderColor: C.line }]}>
        {POINTS.map((p, i) => (
          <View key={p.n} style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: C.line }]}>
            <View style={[s.num, { borderColor: C.border }]}>
              <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>{p.n}</Text>
            </View>
            <View style={s.flex}>
              <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{p.title}</Text>
              <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>{p.sub}</Text>
            </View>
          </View>
        ))}
      </View>
      <Button size="lg" fullWidth icon="plus" onPress={onCreate}>Grup kur</Button>
      <Button size="lg" variant="outline" fullWidth onPress={onJoin}>Davet koduyla katıl</Button>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: STEP.s2 },
  panel: { borderRadius: SHAPE.card, borderWidth: 1, overflow: "hidden", marginBottom: STEP.s2 },
  row: { flexDirection: "row", gap: STEP.s2, padding: STEP.s3, alignItems: "flex-start" },
  num: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, gap: 2 },
});
