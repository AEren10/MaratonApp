import { View, Text, StyleSheet } from "react-native";
import { SectionLabel } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

function InfoRow({ label, value, isLast, C }) {
  return (
    <View style={[s.row, { borderTopColor: C.line }, isLast && { borderBottomWidth: 1, borderBottomColor: C.line }]}>
      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2, flex: 1 }]}>{label}</Text>
      <Text style={[TYPOGRAPHY.topicName, { color: C.text, fontVariant: ["tabular-nums"] }]}>{value}</Text>
    </View>
  );
}

// "Bu konuda" ozet satirlari. Yalniz gercek verisi olan alanlar gosterilir —
// tasarimin "Gecilen durak" satiri bu ekranda hesaplanamiyor, cikarildi.
export function TopicInfoList({ durationLabel, pendingCount, lastLabel }) {
  const C = useC();
  const rows = [
    { label: "Çalışılan süre", value: durationLabel },
    { label: "Defterde bekleyen", value: pendingCount > 0 ? `${pendingCount} soru` : "Yok" },
  ];
  if (lastLabel) rows.push({ label: "Son çalışma", value: lastLabel });

  return (
    <View style={{ marginTop: STEP.s4 }}>
      <SectionLabel>BU KONUDA</SectionLabel>
      {rows.map((r, i) => (
        <InfoRow key={r.label} label={r.label} value={r.value} isLast={i === rows.length - 1} C={C} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: STEP.s2,
    paddingVertical: STEP.s2 + 4,
    borderTopWidth: 1,
  },
});
