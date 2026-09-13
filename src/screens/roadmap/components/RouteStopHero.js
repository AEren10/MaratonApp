import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Durak Detayi ust blogu: "4. DURAK · ■ MATEMATİK", konu, sure ve
// "<ders> rotasında tamamlanan durak" karosu.
export function RouteStopHero({ number, stop, color, subjectCompleted }) {
  const C = useC();
  const subject = stop.subjectLabel || stop.subject;
  const minutes = Math.round(Number(stop.cost?.minutes) || 0);
  return (
    <View style={s.pad}>
      <View style={s.eyebrow}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{number}. DURAK</Text>
        <View style={[s.dot, { backgroundColor: C.text5 }]} />
        <View style={[s.square, { backgroundColor: color }]} />
        <Text style={[TYPOGRAPHY.label, { color }]}>{String(subject).toLocaleUpperCase("tr-TR")}</Text>
      </View>
      <Text style={[TYPOGRAPHY.heading, s.title, { color: C.text }]}>{stop.topic}</Text>
      {minutes > 0 ? (
        <Text style={[TYPOGRAPHY.captionMedium, s.meta, { color: C.text3 }]}>{minutes} dakika</Text>
      ) : null}
      <View style={[s.tile, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{subjectCompleted}</Text>
        <Text style={[TYPOGRAPHY.micro, s.tileText, { color: C.text3 }]}>
          {subject} rotasında tamamlanan durak
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  pad: { paddingHorizontal: GUTTER, paddingTop: STEP.s2 },
  eyebrow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + STEP.s1 / 4 },
  dot: { width: 4, height: 4, borderRadius: SHAPE.chip / 6 },
  square: { width: 8, height: 8, borderRadius: SHAPE.chip / 6 },
  title: { marginTop: STEP.s2, maxWidth: 300 },
  meta: { marginTop: STEP.s2 },
  tile: {
    alignSelf: "flex-start",
    minWidth: "48%",
    marginTop: STEP.s2 + STEP.s1 / 2,
    paddingVertical: STEP.s2,
    paddingHorizontal: STEP.s2 + STEP.s1 / 4,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
  },
  tileText: { marginTop: STEP.s1 / 2 },
});
