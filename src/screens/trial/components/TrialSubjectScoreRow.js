import { memo, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { formatNet } from "../../../lib/format";
import { TrialCountStepper } from "./TrialCountStepper";
import { TrialScoreOverflow } from "./TrialScoreOverflow";

function digits(text, max) {
  const clean = String(text || "").replace(/[^0-9]/g, "");
  if (!clean) return "";
  return String(Math.min(parseInt(clean, 10), max));
}

// Ders satiri (Deneme Gir 2/3). Alan tek basina soru sayisina kadar yazilir;
// toplam asimi engellenmez, TrialScoreOverflow ile hesabin icinde gosterilir.
export const TrialSubjectScoreRow = memo(function TrialSubjectScoreRow({
  subject, values, wrongPenalty, overflow, onChange, onFix,
}) {
  const C = useC();
  const correct = parseInt(values.correct, 10) || 0;
  const wrong = parseInt(values.wrong, 10) || 0;
  const manualEmpty = values.empty == null || values.empty === "" ? null : parseInt(values.empty, 10) || 0;
  const blank = manualEmpty ?? Math.max(0, subject.max - correct - wrong);
  const net = correct - wrong * wrongPenalty;

  const setField = useCallback((field) => (text) => {
    onChange({ ...values, [field]: digits(text, subject.max) });
  }, [onChange, subject.max, values]);

  const stepField = useCallback((field) => (delta) => {
    const current = parseInt(values[field], 10) || 0;
    const next = Math.max(0, Math.min(subject.max, current + delta));
    onChange({ ...values, [field]: String(next) });
  }, [onChange, subject.max, values]);

  return (
    <View style={[styles.row, { borderTopColor: C.line }]}>
      <View style={styles.head} accessible accessibilityLabel={`${subject.name}, ${formatNet(net)} net`}>
        <View style={[styles.dot, { backgroundColor: subject.color }]} />
        <Text style={[TYPOGRAPHY.bodyMedium, styles.name, { color: C.text }]}>{subject.name}</Text>
        <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{formatNet(net)}</Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>net</Text>
      </View>
      <View style={styles.steppers}>
        <TrialCountStepper label="Doğru" value={values.correct} max={subject.max}
          warn={overflow?.field === "correct"} onChangeText={setField("correct")} onStep={stepField("correct")} />
        <TrialCountStepper label="Yanlış" value={values.wrong} max={subject.max}
          warn={overflow?.field === "wrong"} onChangeText={setField("wrong")} onStep={stepField("wrong")} />
      </View>
      <Text style={[TYPOGRAPHY.meta, styles.meta, { color: overflow?.field === "empty" ? C.warn : C.text3 }]}>
        {`${blank} boş · ${subject.max} soru`}
      </Text>
      {overflow ? <TrialScoreOverflow overflow={overflow} onFix={onFix} /> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { paddingVertical: STEP.s3 - 4, borderTopWidth: 1 },
  head: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 + 2 },
  dot: { width: 8, height: 8, borderRadius: 1 },
  name: { flex: 1 },
  steppers: { gap: STEP.s1, marginTop: STEP.s2 },
  meta: { marginTop: STEP.s1 + 1 },
});
