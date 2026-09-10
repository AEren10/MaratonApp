import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/design";
import { STEP, GUTTER } from "../../themes/tokens";
import { TopicPicker } from "../../components/forms/TopicPicker";
import { XPBoostToast } from "../../components/common/XPBoostToast";
import { SaveHeader } from "./components/SaveHeader";
import { SaveSubjectSection } from "./components/SaveSubjectSection";
import { SaveTopicQuestionSection } from "./components/SaveTopicQuestionSection";
import { SaveNotesSection } from "./components/SaveNotesSection";
import { useStudySaveController } from "./useStudySaveController";

export default function StudySaveScreen() {
  const s = useStudySaveController();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: s.C.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <SaveHeader C={s.C} duration={s.duration} onBack={s.goBack} />

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.delay(60).duration(420)}>
            <SaveSubjectSection
              C={s.C}
              showTier={!s.preSubjectKey}
              examTier={s.examTier}
              onSwitchTier={s.handleSwitchTier}
              tierOptions={[["TYT", s.group1Label, s.C.blue], ["AYT", s.group2Label, s.C.purple]]}
              subjects={s.subjects}
              subjectKey={s.subjectKey}
              onSelectSubject={s.handleSelectSubject}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(420)}>
            <SaveTopicQuestionSection
              C={s.C}
              topic={s.topic}
              onOpenTopicPicker={s.openTopicPicker}
              questionCount={s.questionCount}
              onChangeQuestionCount={s.setQuestionCount}
              correctCount={s.correctCount}
              onChangeCorrectCount={s.setCorrectCount}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(420)}>
            <SaveNotesSection C={s.C} notes={s.notes} onChangeNotes={s.setNotes} />
          </Animated.View>
        </ScrollView>

        <View
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0,
            padding: GUTTER, paddingTop: STEP.s3,
            borderTopWidth: 1, borderTopColor: s.C.border, backgroundColor: s.C.bg,
          }}
        >
          <Button onPress={s.save} disabled={!s.canSave || s.saving} loading={s.saving} icon="check" size="lg" fullWidth>
            {s.saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </View>
      </KeyboardAvoidingView>

      {s.currentSubject && s.topicPickerOpen && (
        <TopicPicker
          visible={s.topicPickerOpen}
          subject={s.currentSubject}
          onSelect={(t) => { s.setTopic(t); s.setTopicPickerOpen(false); }}
          onClose={() => s.setTopicPickerOpen(false)}
        />
      )}
      <XPBoostToast amount={s.xpToast.amount} visible={s.xpToast.visible} multiplier={s.xpToast.multiplier} onDismiss={s.dismissXP} />
    </SafeAreaView>
  );
}
