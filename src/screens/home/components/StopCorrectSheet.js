import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../../../components/design";
import { BottomSheet } from "../../../components/design/BottomSheet";
import { Icon } from "../../../components/design/Icon";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { normalizeStopCorrect } from "../../../lib/stopCorrect";
import { GoalSlider } from "../../onboarding/components/GoalSlider";
import * as H from "../../../lib/haptics";

// Durak tikinden sonra "Kac dogru?". Istege bagli: Gec'e basmak dogrulugu
// bilinmiyor birakir, 0 saymaz.
// KLAVYE YOK (9 Ekim): iOS'ta klavye acilinca panel ekranin tepesine
// firliyordu (KeyboardAvoidingView de elle olcum de iki kat kaldirdi).
// Sayi kaydirici ve -/+ ile secilir; "/ 20" artik "20 sorudan" diye okunur.
export function StopCorrectSheet({ stop: current, onAnswer, onSkip }) {
  const C = useC();
  // Kapanis kaymasi surerken icerik bosalmasin: son durak gosterilir.
  const last = useRef(current);
  if (current) last.current = current;
  const stop = current || last.current;
  const [value, setValue] = useState(null);
  const [trackWidth, setTrackWidth] = useState(0);
  useEffect(() => { setValue(null); }, [current?.id]);

  const total = Number(stop?.count) || 0;
  const correctCount = normalizeStopCorrect(value, total);
  const title = stop?.topic || stop?.label || "";
  const bump = (d) => {
    H.select();
    setValue((v) => Math.max(0, Math.min(total, (v ?? Math.round(total / 2)) + d)));
  };

  return (
    <BottomSheet visible={Boolean(current)} onClose={onSkip} style={s.sheet}>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]} numberOfLines={1}>
        {title.toLocaleUpperCase("tr-TR")}
      </Text>
      <Text accessibilityRole="header" style={[TYPOGRAPHY.subheading, s.title, { color: C.text }]}>Kaç doğru?</Text>
      <Text style={[TYPOGRAPHY.body, { color: C.text3 }]}>
        {`${total} sorudan kaçını doğru yaptın? Rota zayıf konuları buna göre seçer. Bilmiyorsan geç.`}
      </Text>

      <View style={s.counter}>
        <Press haptic="none" onPress={() => bump(-1)} accessibilityLabel="Bir azalt"
          style={[s.stepBtn, { borderColor: C.border }]}>
          <Icon name="minus" size={18} color={C.text2} />
        </Press>
        <View style={s.valueRow}>
          <Text style={[TYPOGRAPHY.statLarge, { color: correctCount == null ? C.text3 : C.text }]}>
            {correctCount == null ? "?" : correctCount}
          </Text>
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text3 }]}>{`/ ${total} soru`}</Text>
        </View>
        <Press haptic="none" onPress={() => bump(1)} accessibilityLabel="Bir artır"
          style={[s.stepBtn, { borderColor: C.border }]}>
          <Icon name="plus" size={18} color={C.text2} />
        </Press>
      </View>

      <View onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
        {trackWidth > 0 && total > 0 ? (
          <GoalSlider
            value={correctCount ?? 0}
            onChange={setValue}
            C={C}
            trackWidth={trackWidth}
            min={0}
            max={total}
            step={1}
            accessibilityLabel={`Doğru sayısı, ${total} sorudan`}
          />
        ) : null}
      </View>

      <View style={s.actions}>
        <Press haptic="none" onPress={onSkip} accessibilityRole="button" style={s.skip}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text2 }]}>Geç</Text>
        </Press>
        <View style={s.fill}>
          <Button size="lg" fullWidth disabled={correctCount == null} onPress={() => onAnswer(correctCount)}>Kaydet</Button>
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  sheet: { borderRadius: SHAPE.sheet, borderWidth: 1, padding: STEP.s3, gap: STEP.s1 },
  title: { marginTop: STEP.s1 / 2 },
  counter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: STEP.s2 },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  stepBtn: {
    width: CONTROL.tapMin, height: CONTROL.tapMin, borderRadius: CONTROL.tapMin / 2, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  actions: { flexDirection: "row", alignItems: "center", gap: STEP.s2, marginTop: STEP.s3 },
  skip: { minWidth: CONTROL.tapMin + STEP.s3, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
});
