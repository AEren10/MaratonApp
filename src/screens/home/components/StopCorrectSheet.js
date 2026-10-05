import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { Button } from "../../../components/design";
import { BottomSheet } from "../../../components/design/BottomSheet";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { normalizeStopCorrect } from "../../../domain/study/stopCorrect";

// Durak tikinden sonra "Kac dogru?". Istege bagli: Gec'e basmak ya da bos
// birakmak dogrulugu bilinmiyor birakir, 0 saymaz.
export function StopCorrectSheet({ stop: current, onAnswer, onSkip }) {
  const C = useC();
  // Kapanis kaymasi surerken icerik bosalmasin: son durak gosterilir.
  const last = useRef(current);
  if (current) last.current = current;
  const stop = current || last.current;
  const [value, setValue] = useState("");
  useEffect(() => { setValue(""); }, [current?.id]);

  const total = Number(stop?.count) || 0;
  const n = normalizeStopCorrect(value, total);
  const title = stop?.topic || stop?.label || "";

  return (
    <BottomSheet visible={Boolean(current)} onClose={onSkip} keyboard keyboardBehavior="height" style={s.sheet}>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{`${total} SORU · ${title}`.toLocaleUpperCase("tr-TR")}</Text>
      <Text accessibilityRole="header" style={[TYPOGRAPHY.subheading, s.title, { color: C.text }]}>Kaç doğru?</Text>
      <Text style={[TYPOGRAPHY.body, { color: C.text3 }]}>
        İstersen gir; rota zayıf konuları buna göre seçer. Bilmiyorsan geç.
      </Text>

      <View style={[s.well, { backgroundColor: C.void, borderColor: C.border }]}>
        <TextInput
          value={value}
          onChangeText={(t) => setValue(t.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          maxLength={4}
          autoFocus
          placeholder="?"
          placeholderTextColor={C.text3}
          accessibilityLabel={`Doğru sayısı, ${total} sorudan`}
          style={[TYPOGRAPHY.inputStat, s.input, { color: C.text }]}
        />
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text3 }]}>{`/ ${total}`}</Text>
      </View>

      <View style={s.actions}>
        <Press haptic="none" onPress={onSkip} accessibilityRole="button" style={s.skip}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text2 }]}>Geç</Text>
        </Press>
        <View style={s.fill}>
          <Button size="lg" fullWidth disabled={n == null} onPress={() => onAnswer(n)}>Kaydet</Button>
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  sheet: { borderRadius: SHAPE.sheet, borderWidth: 1, padding: STEP.s3, gap: STEP.s1 },
  title: { marginTop: STEP.s1 / 2 },
  well: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2, alignSelf: "flex-start",
    marginTop: STEP.s2, paddingHorizontal: STEP.s3, height: CONTROL.buttonPrimary,
    borderRadius: SHAPE.cardTight, borderWidth: 1,
  },
  input: { minWidth: 56, textAlign: "center", fontVariant: ["tabular-nums"] },
  actions: { flexDirection: "row", alignItems: "center", gap: STEP.s2, marginTop: STEP.s3 },
  skip: { minWidth: CONTROL.tapMin + STEP.s3, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
});
