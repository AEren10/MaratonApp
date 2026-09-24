import { useState } from "react";
import Animated from "react-native-reanimated";
import { StyleSheet } from "react-native";

import { TopicPicker } from "../../../../components/forms/TopicPicker";
import { dayMonthLabel } from "../../../../domain/study/studyHistoryModel";
import { useAlert } from "../../../../contexts/AlertContext";
import { GUTTER, STEP } from "../../../../themes/tokens";
import * as H from "../../../../lib/haptics";
import { DateSheet } from "./DateSheet";
import { RecordFormCard } from "./RecordFormCard";
import { RecordNumberField } from "./RecordNumberField";
import { RecordRow } from "./RecordRow";
import { SubjectSheet } from "./SubjectSheet";

// Elle giris ve Kaydi Duzenle'nin ortak formu: DERS, KONU, TARIH, SORU, SURE.
export function StudyRecordFields({ form, groups, dateExtraKey }) {
  const showAlert = useAlert();
  const [sheet, setSheet] = useState(null);
  const close = () => setSheet(null);
  const subject = groups.flatMap((g) => g.subjects).find((s) => s.key === form.subjectKey) || null;

  const openTopic = () => {
    if (!subject) { H.warn(); showAlert("Önce ders seç", "Konu listesi için ders seçmelisin."); return; }
    H.select();
    setSheet("topic");
  };

  return (
    <Animated.View style={styles.wrap}>
      <RecordFormCard>
        <RecordRow label="DERS" value={subject?.label || subject?.name || form.subjectLabel} placeholder="Seç" onPress={() => { H.select(); setSheet("subject"); }} />
        <RecordRow label="KONU" value={form.topic} placeholder="Seç" onPress={openTopic} />
        <RecordRow label="TARİH" value={dayMonthLabel(form.studyDate)} onPress={() => { H.select(); setSheet("date"); }} />
        <RecordRow label="SORU">
          <RecordNumberField value={form.questions} onChange={form.setQuestions} maxLength={4} a11yLabel="Çözülen soru" />
        </RecordRow>
        <RecordRow label="SÜRE">
          <RecordNumberField value={form.minutes} onChange={form.setMinutes} suffix="dk" width={88} a11yLabel="Süre, dakika" />
        </RecordRow>
      </RecordFormCard>

      <SubjectSheet visible={sheet === "subject"} groups={groups} selectedKey={form.subjectKey} onSelect={form.pickSubject} onClose={close} />
      <DateSheet visible={sheet === "date"} selectedKey={form.studyDate} extraKey={dateExtraKey} onSelect={form.setStudyDate} onClose={close} />
      {subject && sheet === "topic" ? (
        <TopicPicker visible subject={subject} onSelect={(t) => form.setTopic(t)} onClose={close} />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 2 },
});
