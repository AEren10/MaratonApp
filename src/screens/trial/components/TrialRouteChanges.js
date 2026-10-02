import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

import { SubjectIcon } from "../../../components/common/SubjectIcon";
import { Press } from "../../../components/design/Press";
import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import { useStudyRoute } from "../../../hooks/useStudyRoute";
import { trialRouteChanges } from "../../../domain/route/trialRouteChanges";
import { selectTrials } from "../../../store/slices/trialSlice";
import { getSubjectByKey } from "../../../themes/subjects";
import { CONTROL, STEP, TYPOGRAPHY } from "../../../themes/tokens";

function ChangeRow({ row, C }) {
  const sid = useSubjectIdentity(row.subject);
  return (
    <View style={[s.row, { borderTopColor: C.line }]}>
      <SubjectIcon subject={row.label} subjectKey={row.subject} color={sid?.solid} size={32} />
      <View style={s.body}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>
          {`${row.label} bu denemede geriledi; rotan bu derse ağırlık verdi.`}
        </Text>
        {row.nextTopic ? (
          <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>{`Sıradaki ${row.label} durağı: ${row.nextTopic}`}</Text>
        ) : null}
      </View>
    </View>
  );
}

// DENEME SONRASI "ROTANDA NE DEGISTI": denemenin rotaya etkisi neden-sonuc
// olarak. Yalniz motorun gercekten kullandigi sinyal (ders dususu); dusus
// yoksa bolum yok (uydurma degisiklik soylenmez).
export function TrialRouteChanges({ onOpenRoute, style }) {
  const C = useC();
  const trials = useSelector(selectTrials);
  const { weeks } = useStudyRoute({ persist: false });
  const rows = useMemo(
    () => trialRouteChanges({ trials, weeks, labelOf: (k) => getSubjectByKey(k)?.label }),
    [trials, weeks],
  );
  if (!rows.length) return null;
  return (
    <View style={style}>
      <Text style={[TYPOGRAPHY.label, s.label, { color: C.text2 }]}>ROTANDA NE DEĞİŞTİ</Text>
      {rows.map((row) => <ChangeRow key={row.subject} row={row} C={C} />)}
      {onOpenRoute ? (
        <Press haptic="tap" onPress={onOpenRoute} accessibilityRole="button" style={s.link}>
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>Rotanın tamamını gör ›</Text>
        </Press>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  label: { marginBottom: STEP.s1 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s2, borderTopWidth: 1 },
  body: { flex: 1, minWidth: 0, gap: 2 },
  link: { minHeight: CONTROL.tapMin, justifyContent: "center" },
});
