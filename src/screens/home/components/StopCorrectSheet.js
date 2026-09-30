import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Durak tikinden sonra "Kac dogru?". Istege bagli: Gec'e basmak ya da bos
// birakmak dogrulugu bilinmiyor birakir, 0 saymaz.
export function StopCorrectSheet({ stop, onAnswer, onSkip }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState("");
  useEffect(() => { setValue(""); }, [stop?.id]);

  const total = Number(stop?.count) || 0;
  const n = Math.min(parseInt(value, 10) || 0, total);
  const title = stop?.topic || stop?.label || "";

  return (
    <Modal visible={Boolean(stop)} transparent animationType="fade" statusBarTranslucent onRequestClose={onSkip}>
      <KeyboardAvoidingView style={s.fill} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable style={[s.backdrop, { backgroundColor: C.scrim }]} onPress={onSkip} accessibilityLabel="Geç">
          <Pressable
            accessibilityViewIsModal
            onPress={(e) => e.stopPropagation()}
            style={[s.sheet, { marginBottom: insets.bottom + STEP.s3, backgroundColor: C.surface, borderColor: C.elev }]}
          >
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
                <Button size="lg" fullWidth disabled={n <= 0} onPress={() => onAnswer(n)}>Kaydet</Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: { flex: 1, justifyContent: "flex-end", paddingHorizontal: STEP.s3 },
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
