import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

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
      <View style={s.metaRow}>
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>Bugün 19:30</Text>
        {minutes > 0 ? (
          <>
            <View style={[s.dot, { backgroundColor: C.text5 }]} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>{minutes} dakika</Text>
          </>
        ) : null}
      </View>
      <View style={s.tileRow}>
        <View style={[s.tile, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{subjectCompleted}</Text>
          <Text style={[TYPOGRAPHY.micro, s.tileText, { color: C.text3 }]}>
            {subject} rotasında tamamlanan durak
          </Text>
        </View>
        <View style={[s.tile, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <View style={s.momentumEyebrow}>
            <View style={[s.square, { backgroundColor: C.up }]} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.up, flexShrink: 1 }]}>Bu haftanın ivmesi yükseldi</Text>
          </View>
          <Text style={[TYPOGRAPHY.micro, s.tileText, { color: C.text3 }]}>
            Rota göstergesi · net tahmini değil
          </Text>
        </View>
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
  metaRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + STEP.s1 / 4, marginTop: STEP.s2 },
  tileRow: { flexDirection: "row", alignItems: "stretch", gap: STEP.s1, marginTop: STEP.s2 + STEP.s1 / 2 },
  tile: {
    flex: 1,
    paddingVertical: STEP.s2,
    paddingHorizontal: STEP.s2 + STEP.s1 / 4,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
  },
  tileText: { marginTop: STEP.s1 / 2 },
  momentumEyebrow: { flexDirection: "row", alignItems: "flex-start", gap: STEP.s1 },
});
