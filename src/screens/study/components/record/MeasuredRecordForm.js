import { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import { Button } from "../../../../components/design";
import { getSubjectByKey } from "../../../../themes/subjects";
import { dayMonthLabel } from "../../../../domain/study/studyHistoryModel";
import { GUTTER, STEP } from "../../../../themes/tokens";
import { MeasuredBanner } from "./MeasuredBanner";
import { RecordFormCard } from "./RecordFormCard";
import { RecordHeader } from "./RecordHeader";
import { RecordIntro } from "./RecordIntro";
import { RecordNumberField } from "./RecordNumberField";
import { RecordRow } from "./RecordRow";
import { SubjectSheet } from "./SubjectSheet";

// "Kayıt · Ölçülmüş" (MOD 1): sure zamanlayicidan gelir ve kilitli; ayni
// kayit denetleyicisini (useStudySaveController) kullanir.
export function MeasuredRecordForm({ s }) {
  const [subjectOpen, setSubjectOpen] = useState(false);
  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <RecordHeader title="Ne çalıştın?" onBack={s.goBack} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <RecordIntro>Süreyi biz tuttuk. Sen sadece dersi, konuyu ve çözdüğün soruyu yaz.</RecordIntro>
        <Animated.View style={styles.block}>
          <MeasuredBanner minutes={s.duration} range={s.measuredRange} />
        </Animated.View>
        <Animated.View style={styles.blockLg}>
          <RecordFormCard>
            <RecordRow label="DERS" value={s.currentSubject?.label || s.currentSubject?.name || getSubjectByKey(s.subjectKey)?.label} placeholder="Seç" onPress={() => setSubjectOpen(true)} />
            <RecordRow label="KONU" value={s.topic} placeholder="Seç" onPress={s.openTopicPicker} />
            <RecordRow label="TARİH" value={dayMonthLabel(s.studyDate)} />
            <RecordRow label="SORU">
              <RecordNumberField value={s.questionCount} onChange={s.setQuestionCount} maxLength={4} a11yLabel="Çözülen soru" />
            </RecordRow>
            <RecordRow label="SÜRE">
              <RecordNumberField locked value={s.duration} suffix="dk" a11yLabel={`Ölçülen süre ${s.duration} dakika`} />
            </RecordRow>
          </RecordFormCard>
        </Animated.View>
        <Animated.View style={styles.blockLg}>
          <Button size="lg" fullWidth onPress={s.save} disabled={!s.canSave} loading={s.saving}>Kaydet</Button>
        </Animated.View>
      </ScrollView>
      <SubjectSheet
        visible={subjectOpen}
        groups={s.subjectGroups}
        selectedKey={s.subjectKey}
        onSelect={s.pickSubject}
        onClose={() => setSubjectOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingBottom: STEP.s4 + 6 },
  block: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  blockLg: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 2 },
});
