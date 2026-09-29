import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/design";
import { XPBoostToast } from "../../components/common/XPBoostToast";
import { useC } from "../../contexts/ThemeContext";
import { GUTTER, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { RecordHeader } from "./components/record/RecordHeader";
import { RecordIntro } from "./components/record/RecordIntro";
import { StudyRecordFields } from "./components/record/StudyRecordFields";
import { UnsavedSessionView } from "./components/record/UnsavedSessionView";
import { useAddStudyController } from "./useAddStudyController";

// "Kayıt · Elle" (MOD 2 · Artı sayfasından).
export default function AddStudyScreen() {
  const C = useC();
  const a = useAddStudyController();
  const toast = (
    <XPBoostToast amount={a.xpToast.amount} visible={a.xpToast.visible} multiplier={a.xpToast.multiplier} onDismiss={a.dismissXP} />
  );

  if (a.unsaved.pending) {
    return (
      <>
        <UnsavedSessionView unsaved={a.unsaved} onBack={a.unsaved.later} />
        {toast}
      </>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.fill, { backgroundColor: C.bg }]}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <RecordHeader title="Çalışma kaydet" onBack={a.goBack} />
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <RecordIntro>Zamanlayıcı olmadan çalıştıysan aynı formu doldur — süreyi sen giriyorsun.</RecordIntro>
          <StudyRecordFields form={a.form} groups={a.groups} />
          <Animated.View style={styles.cta}>
            <Button size="lg" fullWidth onPress={a.save} disabled={!a.form.canSave} loading={a.saving}>
              Kaydet
            </Button>
            {!a.form.canSave ? (
              <Text style={[TYPOGRAPHY.micro, styles.hint, { color: C.text3 }]}>
                Ders ve soru ya da süre gir
              </Text>
            ) : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      {toast}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingBottom: STEP.s4 + STEP.s1 },
  cta: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + STEP.s1 / 4 },
  hint: { textAlign: "center", marginTop: STEP.s2, letterSpacing: 0 },
});
