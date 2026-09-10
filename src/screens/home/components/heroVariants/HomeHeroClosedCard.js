import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../../../components/design/Card";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";

// "BU HAFTA KAPALI" karti - son hafta modunda hangi ozelliklerin
// gizlendigini uzeri cizili chip'lerle gosterir. Tasarim AKIS 14.
export function HomeHeroClosedCard({ items = [], note }) {
  const C = useC();
  return (
    <Card tone="surface" style={s.card}>
      <Text style={[TYPOGRAPHY.captionMedium, s.label, { color: C.text2 }]}>BU HAFTA KAPALI</Text>
      <View style={s.chips}>
        {items.map((item) => (
          <View key={item} style={[s.chip, { borderColor: C.border }]}>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3, textDecorationLine: "line-through" }]}>
              {item}
            </Text>
          </View>
        ))}
      </View>
      {note ? (
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s2 }]}>{note}</Text>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { borderColor: undefined },
  label: { letterSpacing: 1.5, marginBottom: STEP.s2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    height: 32,
    paddingHorizontal: 13,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
