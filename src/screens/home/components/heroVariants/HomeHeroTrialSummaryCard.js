import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../../../components/design/Card";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";

// "EN İYİ DENEMEN / SON 5 ORTALAMAN" - son hafta modlarinin ortak kanit
// karti. Trial verisi yoksa hic render edilmemeli (cagiran taraf kontrol eder).
export function HomeHeroTrialSummaryCard({ best, average, note }) {
  const C = useC();
  return (
    <Card tone="surface">
      <View style={s.row}>
        <View style={s.col}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3, letterSpacing: 1.5 }]}>
            EN İYİ DENEMEN
          </Text>
          <Text style={[s.value, { color: C.text }]} allowFontScaling={false}>{best}</Text>
        </View>
        <View style={[s.divider, { backgroundColor: C.line }]} />
        <View style={s.col}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3, letterSpacing: 1.5 }]}>
            SON 5 ORTALAMAN
          </Text>
          <Text style={[s.value, { color: C.text }]} allowFontScaling={false}>{average}</Text>
        </View>
      </View>
      {note ? (
        <>
          <View style={[s.hr, { backgroundColor: C.line }]} />
          <Text style={[TYPOGRAPHY.body, { color: C.text2 }]}>{note}</Text>
        </>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: STEP.s3 },
  col: { flex: 1 },
  value: {
    fontFamily: "Bricolage_400",
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
    marginTop: 10,
  },
  divider: { width: 1 },
  hr: { height: 1, marginVertical: STEP.s3 },
});
