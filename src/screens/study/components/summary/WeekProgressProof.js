import { StyleSheet, Text, View } from "react-native";

import { SubjectIcon } from "../../../../components/common/SubjectIcon";
import { useC, useSubjectIdentity } from "../../../../contexts/ThemeContext";
import { getSubjectLabel } from "../../../../themes/subjects";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

function GainRow({ gain, C }) {
  const sid = useSubjectIdentity(gain.subject);
  return (
    <View style={[s.row, { borderTopColor: C.line }]}>
      <SubjectIcon subject={getSubjectLabel(gain.subject)} subjectKey={gain.subject} color={sid?.solid} size={30} />
      <Text style={[TYPOGRAPHY.bodySemiBold, s.flex, { color: C.text }]} numberOfLines={1}>{gain.topic}</Text>
      <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text3 }]}>{`%${gain.before}`}</Text>
      <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text3 }]}>→</Text>
      <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.up }]}>{`%${gain.after}`}</Text>
    </View>
  );
}

// HAFTALIK RAPOR: "BU HAFTA NE KAZANDIN". Aktivite degil gelisim kaniti:
// plana uyum, en verimli gun, dogrulugu artan konular. Hepsi hesaplanmis
// gercek veri (weekSummary); eskiden hesaplanip ekrana cizilmiyordu.
export function WeekProgressProof({ data }) {
  const C = useC();
  const planned = data.totals?.stopsPlanned || 0;
  const done = data.totals?.stopsDone || 0;
  const gains = data.gains || [];
  if (!planned && !data.bestLine && !gains.length && !data.headline) return null;
  const ratio = planned > 0 ? Math.min(1, done / planned) : 0;

  return (
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BU HAFTA NE KAZANDIN</Text>
      {data.headline ? <Text style={[TYPOGRAPHY.bodySemiBold, s.headline, { color: C.up }]}>{data.headline}</Text> : null}
      {planned > 0 ? (
        <View style={s.block}>
          <Text style={[TYPOGRAPHY.body, { color: C.text }]}>{`Bitirilen durak: ${done} / ${planned}`}</Text>
          <View style={[s.track, { backgroundColor: C.track }]}>
            <View style={[s.fill, { width: `${Math.round(ratio * 100)}%`, backgroundColor: C.up }]} />
          </View>
        </View>
      ) : null}
      {data.bestLine ? (
        <Text style={[TYPOGRAPHY.body, s.block, { color: C.text2 }]}>{`En verimli günün: ${data.bestLine.value}`}</Text>
      ) : null}
      {gains.length ? (
        <View style={s.block}>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>Doğruluğu artan konular (geçen haftaya göre)</Text>
          {gains.map((g) => <GainRow key={`${g.subject}-${g.topic}`} gain={g} C={C} />)}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, marginTop: STEP.s4 },
  headline: { marginTop: STEP.s1 },
  block: { marginTop: STEP.s2 },
  track: { height: 6, borderRadius: 3, marginTop: STEP.s1, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s1, paddingVertical: STEP.s1, borderTopWidth: 1, marginTop: STEP.s1 },
  flex: { flex: 1 },
});
