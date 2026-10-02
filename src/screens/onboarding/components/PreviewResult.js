import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { SubjectIcon } from "../../../components/common/SubjectIcon";
import { useSubjectIdentity } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

function StopRow({ stop, first, C }) {
  const sid = useSubjectIdentity(stop.subject);
  return (
    <View style={[s.row, { borderTopColor: C.line }, first && s.rowFirst]}>
      <SubjectIcon subject={stop.subjectLabel} subjectKey={stop.subject} color={sid?.solid} size={32} />
      <View style={s.body}>
        <Text style={[TYPOGRAPHY.label, { color: sid?.solid || C.text2 }]} numberOfLines={1}>
          {String(stop.subjectLabel || "").toLocaleUpperCase("tr-TR")}
        </Text>
        <Text style={[TYPOGRAPHY.tableName, { color: C.text }]} numberOfLines={1}>{stop.topic}</Text>
        {first && stop.reason ? (
          <Text style={[TYPOGRAPHY.meta, s.reason, { color: C.text3 }]}>{stop.reason}</Text>
        ) : null}
      </View>
      {stop.minutes > 0 ? (
        <Text style={[TYPOGRAPHY.tableValue, { color: C.text2 }]}>{`${stop.minutes} dk`}</Text>
      ) : null}
    </View>
  );
}

// Onizleme sonucu: rota gercekten cizildi, ilk duraklar ve nedenleri.
// Kutusuz: buyuk sayi + tek cumle + ayracli satirlar.
export function PreviewResult({ preview, C }) {
  return (
    <Animated.View entering={FadeIn.duration(320)}>
      <Text style={[TYPOGRAPHY.label, s.tag, { color: C.accentText }]}>ROTAN HAZIR</Text>
      <View style={s.heroRow}>
        <Text style={[TYPOGRAPHY.statLarge, { color: C.text }]}>{preview.weeksLeft}</Text>
        <Text style={[TYPOGRAPHY.subheading, s.unit, { color: C.text2 }]}>hafta</Text>
      </View>
      <Text style={[TYPOGRAPHY.body, s.sentence, { color: C.text2 }]}>
        {`Sınava kadar ${preview.topics} konuyu ${preview.weeksLeft} haftaya böldük. Her deneme girdiğinde rotan yeniden çizilir.`}
      </Text>

      <Text style={[TYPOGRAPHY.label, s.section, { color: C.text3 }]}>İLK DURAKLARIN</Text>
      {preview.firstStops.map((stop, i) => (
        <StopRow key={stop.key} stop={stop} first={i === 0} C={C} />
      ))}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  tag: { marginTop: STEP.s3 },
  heroRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1, marginTop: STEP.s1 },
  unit: { marginBottom: STEP.s1 },
  sentence: { marginTop: STEP.s1 },
  section: { marginTop: STEP.s4, marginBottom: STEP.s1 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s2, borderTopWidth: 1 },
  rowFirst: { alignItems: "flex-start" },
  body: { flex: 1, minWidth: 0, gap: 2 },
  reason: { marginTop: STEP.s1 / 2 },
});
