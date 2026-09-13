import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button, ErrorState, Skeleton } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { ERROR_COPY } from "../../constants/stateCopy";
import { useExamResult } from "../../hooks/useExamResult";
import { ExamScreenHeader } from "./components/ExamScreenHeader";
import { ExamResultFieldRow } from "./components/ExamResultFieldRow";

// Tasarim AKIS 14 · "Sınav Sonucu". Alanlar rotanin sinav turunden gelir.
// "Belgeyi fotoğrafla" ve altindaki OCR cumlesi CIZILMIYOR: uygulamada
// belge okuma servisi yok (kapsam raporu #24), calismayan buton konmaz.
const FADE = (delay) => FadeInDown.delay(delay).duration(500);
const DOT_KEYS = ["turkce", "matematik", "fizik"];

export default function ExamResultScreen() {
  const C = useC();
  const r = useExamResult();
  const body = r.days != null
    ? `Acele yok. Sonuç açıklandığında girersin — ${r.days} günün kaydı yerinde duruyor.`
    : "Acele yok. Sonuç açıklandığında girersin.";

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <ExamScreenHeader onBack={r.back} />
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FADE(0)}>
            <Text style={[TYPOGRAPHY.label, s.eyebrow, { color: C.accentBright }]}>SINAV BİTTİ</Text>
            <Text style={[TYPOGRAPHY.heading, s.title, { color: C.text }]}>Hazır olduğunda sonucunu gir.</Text>
            <Text style={[TYPOGRAPHY.body, s.body, { color: C.text2 }]}>{body}</Text>
          </Animated.View>

          {r.status === "loading" ? (
            <View style={s.block}>
              {r.fields.map((f) => <Skeleton key={f.key} height={68} radius={SHAPE.panel} style={s.skel} />)}
            </View>
          ) : null}

          {r.status === "error" ? <ErrorState preset="server" onPrimary={r.retry} style={s.block} /> : null}

          {r.status === "ready" ? (
            <>
              <Animated.View entering={FADE(80)} style={[s.block, s.fields]}>
                {r.fields.map((f, i) => (
                  <ExamResultFieldRow
                    key={f.key}
                    field={f}
                    color={C.subjects[DOT_KEYS[i]] || C.accent}
                    value={r.values[f.key] || ""}
                    error={r.errors[f.key]}
                    onChange={r.setValue}
                  />
                ))}
              </Animated.View>

              <Animated.View entering={FADE(160)} style={s.cta}>
                <Button size="lg" fullWidth onPress={r.save} loading={r.saving} disabled={!r.canSave}>
                  Sonucumu kaydet
                </Button>
                {r.saveFailed ? (
                  <Text style={[TYPOGRAPHY.meta, s.fail, { color: C.text2 }]}>{ERROR_COPY.server.title}</Text>
                ) : null}
              </Animated.View>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s4 + 6 },
  eyebrow: { letterSpacing: 2.8 },
  title: { marginTop: STEP.s2 + 2, maxWidth: 300 },
  body: { marginTop: STEP.s2 + 2, maxWidth: 300 },
  block: { marginTop: STEP.s3 + 6 },
  fields: { gap: STEP.s1 },
  skel: { marginBottom: STEP.s1 },
  cta: { marginTop: STEP.s3 + 6 },
  fail: { marginTop: STEP.s2, textAlign: "center" },
});
