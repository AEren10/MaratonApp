import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// "N GÜNÜN KAYDI": soru · sa · durak · deneme. Kaynagi olmayan sayi
// listeye hic girmez (useForecastAccuracy filtreler).
export function ExamRecapCard({ recap }) {
  const C = useC();
  if (!recap) return null;
  return (
    <Card tone="surface" radius="sheet" style={{ borderColor: C.elev }}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>{recap.title}</Text>
      <View style={s.row}>
        {recap.items.map((item) => (
          <View key={item.unit}>
            <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]} allowFontScaling={false}>{item.value}</Text>
            <Text style={[TYPOGRAPHY.micro, s.unit, { color: C.text3 }]}>{item.unit}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s3 + 2, marginTop: STEP.s2 + 4 },
  unit: { marginTop: 5 },
});
