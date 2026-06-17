import { useCallback, useMemo } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import { Icon } from "../../../components/design";
import * as H from "../../../lib/haptics";

// Ders satırı: kimlik renkli sol şerit + ad + 3 input (D/Y/B otomatik) + net
export function SubjectInput({ subject, values, onChange, wrongPenalty = 0.25 }) {
  const C = useC();
  const id = useSubjectIdentity(subject.key);
  const { name, icon, max } = subject;
  const color = id?.solid || subject.color;
  const tint  = id?.tint  || (color + "14");

  const correct = parseInt(values.correct, 10) || 0;
  const wrong   = parseInt(values.wrong,   10) || 0;

  // Boş = max - doğru - yanlış (kullanıcı isterse manuel override eder)
  const emptyAuto = Math.max(0, max - correct - wrong);
  const emptyInput = values.empty != null ? values.empty : String(emptyAuto);

  const net = useMemo(() => (correct - wrong * wrongPenalty).toFixed(2), [correct, wrong, wrongPenalty]);

  const cap = useCallback((t, limit) => {
    const clean = t.replace(/[^0-9]/g, "");
    if (!clean) return "";
    const num = parseInt(clean, 10);
    if (isNaN(num)) return "";
    if (num > limit) return String(limit);
    return clean;
  }, []);

  const setCorrect = useCallback((t) => {
    const newCorrect = cap(t, max);
    const c = parseInt(newCorrect, 10) || 0;
    const w = parseInt(values.wrong, 10) || 0;
    const cappedWrong = w > max - c ? String(max - c) : values.wrong;
    onChange({ ...values, correct: newCorrect, wrong: cappedWrong });
  }, [values, onChange, max, cap]);

  const setWrong = useCallback((t) => {
    onChange({ ...values, wrong: cap(t, max - correct) });
  }, [values, onChange, max, correct, cap]);

  const setEmpty = useCallback((t) => onChange({ ...values, empty: cap(t, max) }), [values, onChange, max, cap]);

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={s.body}>
        {/* Header: ikon + ad + max + net */}
        <View style={s.head}>
          <View style={[s.iconBox, { backgroundColor: tint }]}>
            <Icon name={icon} size={18} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.name, { color: C.text }]}>{name}</Text>
            <Text style={[s.max, { color: C.muted }]}>{max} soru</Text>
          </View>
          <View style={[s.netBadge, { backgroundColor: color + "16" }]}>
            <Text style={[s.netValue, { color: color }]}>{net}</Text>
            <Text style={[s.netLabel, { color }]}>net</Text>
          </View>
        </View>

        {/* Inputs D / Y / B */}
        <View style={s.inputs}>
          <NumInput label="Doğru" value={values.correct} onChange={setCorrect} max={max} tone={C.green} C={C} />
          <NumInput label="Yanlış" value={values.wrong}   onChange={setWrong}   max={max} tone={C.red}   C={C} />
          <NumInput label="Boş"    value={emptyInput}     onChange={setEmpty}   max={max} tone={C.muted} C={C} dim />
        </View>
      </View>
    </View>
  );
}

function NumInput({ label, value, onChange, max, tone, C, dim }) {
  return (
    <View style={s.inputWrap}>
      <Text style={[s.inputLabel, { color: dim ? C.muted : tone }]}>{label.toUpperCase()}</Text>
      <TextInput
        value={String(value || "")}
        onChangeText={onChange}
        onFocus={() => H.tap()}
        keyboardType="number-pad"
        maxLength={String(max).length}
        placeholder="0"
        placeholderTextColor={C.muted}
        style={[
          s.input,
          {
            color: C.text,
            backgroundColor: C.surface2,
            borderColor: dim ? C.border : tone + "30",
          },
        ]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  body: { padding: 14 },
  head: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  iconBox: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  name: { ...TYPOGRAPHY.bodySemiBold },
  max: { ...TYPOGRAPHY.micro, marginTop: 1 },
  netBadge: {
    flexDirection: "row", alignItems: "baseline", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  netValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, letterSpacing: -0.3 },
  netLabel: { ...TYPOGRAPHY.micro, fontFamily: "Inter_600SemiBold" },
  inputs: { flexDirection: "row", gap: 8 },
  inputWrap: { flex: 1 },
  inputLabel: { ...TYPOGRAPHY.micro, marginBottom: 4, letterSpacing: 0.5 },
  input: {
    fontFamily: "SpaceGrotesk_700Bold", fontSize: 20,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    textAlign: "center",
    letterSpacing: -0.3,
  },
});
