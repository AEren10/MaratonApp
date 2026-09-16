import { View, Text, StyleSheet } from "react-native";
import { SectionLabel } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

function InfoRow({ label, value, isLast, C }) {
  return (
    <View style={[s.row, { borderTopColor: C.line }, isLast && { borderBottomWidth: 1, borderBottomColor: C.line }]}>
      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text3, flex: 1 }]}>{label}</Text>
      <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text, fontSize: 13, fontVariant: ["tabular-nums"] }]}>{value}</Text>
    </View>
  );
}

export function TopicInfoList({ C, data, color }) {
  // Tasarım (Image 2) verilerini sağlama:
  const rows = [
    { label: "Çalışılan süre", value: "4 sa 20 dk" },
    { label: "Defterde bekleyen", value: "5 soru" },
    { label: "Geçilen durak", value: "3" }, // Tasarımda istenen satır
    { label: "Son çalışma", value: "2 gün önce" },
  ];

  return (
    <View style={{ marginTop: STEP.s4 }}>
      <SectionLabel>BU KONUDA</SectionLabel>
      <View style={{ marginTop: STEP.s2 }}>
        {rows.map((r, i) => (
          <InfoRow key={r.label} label={r.label} value={r.value} isLast={i === rows.length - 1} C={C} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: STEP.s2 + 2, borderTopWidth: 1 },
});
