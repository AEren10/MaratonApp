import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, ErrorState } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { RecordHeader } from "./components/record/RecordHeader";
import { RecordIntro } from "./components/record/RecordIntro";
import { StudyRecordFields } from "./components/record/StudyRecordFields";
import { useEditStudyLogController } from "./useEditStudyLogController";

// "Kaydı Düzenle" (MOD 3 · Düzeltme). Çalışma Geçmişi satırından açılır.
export default function EditStudyLogScreen() {
  const C = useC();
  const e = useEditStudyLogController();

  return (
    <SafeAreaView edges={["top"]} style={[styles.fill, { backgroundColor: C.bg }]}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <RecordHeader title="Kaydı düzenle" onBack={e.goBack} />
        {!e.log ? (
          <ErrorState preset="server" secondary="" onPrimary={e.goBack} primary="Geri" style={styles.gutter} />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <RecordIntro>
              Yanlış girdiğin kayıt rotayı bozar. Alanlar dolu gelir; dersi, süreyi ve tarihi değiştirebilirsin.
            </RecordIntro>
            <StudyRecordFields form={e.form} groups={e.groups} dateExtraKey={e.log.study_date} />
            {e.impact ? (
              <Animated.View style={styles.block}>
                <View style={[styles.impact, { backgroundColor: C.brandTint, borderColor: C.border }]}>
                  <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>DEĞİŞİKLİĞİN ETKİSİ</Text>
                  <Text style={[TYPOGRAPHY.meta, styles.impactText, { color: C.text2 }]}>{e.impact}</Text>
                </View>
              </Animated.View>
            ) : null}
            <Animated.View style={styles.block}>
              <Button size="lg" fullWidth onPress={e.save} disabled={!e.form.canSave} loading={e.saving}>Kaydet</Button>
              <Pressable onPress={e.remove} accessibilityRole="button" style={styles.delete}>
                <Text style={[TYPOGRAPHY.metaSemiBold, styles.deleteText, { color: C.text3 }]}>Kaydı sil</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  gutter: { paddingHorizontal: GUTTER },
  scroll: { paddingBottom: STEP.s4 + 6 },
  block: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  impact: { paddingVertical: STEP.s3 - 2, paddingHorizontal: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1 },
  impactText: { marginTop: STEP.s1, lineHeight: 20 },
  delete: { height: CONTROL.tapMin, marginTop: STEP.s2, alignItems: "center", justifyContent: "center" },
  deleteText: { fontSize: TYPOGRAPHY.caption.fontSize },
});
