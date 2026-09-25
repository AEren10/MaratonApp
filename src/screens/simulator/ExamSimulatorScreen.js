import { useCallback } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Button, Icon, Skeleton } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAlert } from "../../contexts/AlertContext";
import { SCREENS } from "../../constants/screens";
import { useExamRehearsalSetup } from "../../hooks/useExamRehearsalSetup";
import { useRehearsalTimer } from "../../hooks/useRehearsalTimer";
import * as H from "../../lib/haptics";
import { RehearsalSetup } from "./components/RehearsalSetup";
import { RehearsalRunning } from "./components/RehearsalRunning";
import { RehearsalDone } from "./components/RehearsalDone";
import { Press } from "../../components/design/Press";

// Tasarim AKIS 14 · "Deneme Provası". Girisler: Son Hafta "Deneme provası
// kur", Analiz pratik satiri, Ana Sayfa hizli eylem ve prova sabahi bildirimi.
// Kurulum → (prova gunu) oturum → bitis. Mantik hook'larda.
export default function ExamSimulatorScreen() {
  const C = useC();
  const navigation = useNavigation();
  const showAlert = useAlert();
  const r = useExamRehearsalSetup();
  const t = useRehearsalTimer({ userId: r.userId, session: r.session });

  const saveAndClose = useCallback(async () => {
    if (await r.save()) navigation.goBack();
  }, [r, navigation]);

  const confirmFinish = useCallback(() => {
    H.warn();
    showAlert("Bitir", "Simülasyonu bitirmek istiyor musun?", [
      { text: "İptal", style: "cancel" },
      { text: "Bitir", onPress: t.finishEarly },
    ]);
  }, [showAlert, t.finishEarly]);

  if (t.phase === "running") {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <RehearsalRunning session={r.session} remaining={t.remaining} total={t.total} onFinish={confirmFinish} />
      </SafeAreaView>
    );
  }

  if (t.phase === "done") {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <RehearsalDone
          full={t.full}
          elapsed={t.elapsed}
          onEnterResults={() => { H.select(); navigation.replace(SCREENS.TRIAL_ENTRY); }}
          onClose={navigation.goBack}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.header}>
        <Press haptic="none" onPress={navigation.goBack} hitSlop={8} accessibilityRole="button" accessibilityLabel="Kapat" style={s.close}>
          <Icon name="x" size={14} color={C.text2} />
        </Press>
      </View>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {r.status === "loading" ? (
            <View style={s.skel}>
              <Skeleton height={34} width={240} />
              <Skeleton height={232} radius={SHAPE.sheet} style={s.skelGap} />
            </View>
          ) : (
            <RehearsalSetup r={r} />
          )}
          <View style={s.cta}>
            {r.startableToday ? (
              <Button size="lg" fullWidth onPress={t.start}>Başla</Button>
            ) : (
              <Button size="lg" fullWidth onPress={saveAndClose} loading={r.saving} disabled={!r.valid}>
                Provayı kur
              </Button>
            )}
            <Press haptic="none" onPress={navigation.goBack} accessibilityRole="button" accessibilityLabel="Vazgeç" style={s.cancel}>
              <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>Vazgeç</Text>
            </Press>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: "row", paddingLeft: GUTTER - 10, paddingTop: 4 },
  close: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: STEP.s4 + 6 },
  skel: { paddingTop: STEP.s4 },
  skelGap: { marginTop: STEP.s4 },
  cta: { marginTop: STEP.s3 + 6 },
  cancel: { height: 48, marginTop: STEP.s1, alignItems: "center", justifyContent: "center" },
});
