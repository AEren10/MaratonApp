import { ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button } from "../../../components/design";
import { EMPTY_TRIAL_SCORE } from "../../../domain/trial/trialEntryModel";
import { BranchSubjectPicker } from "./BranchSubjectPicker";
import { SubjectInput } from "./SubjectInput";
import { TotalCard } from "./TotalCard";
import { TrialEntryDatePicker } from "./TrialEntryDatePicker";
import { TrialEntryMoodSelector } from "./TrialEntryMoodSelector";
import { TrialEntryTitleField } from "./TrialEntryTitleField";
import { TrialNormalizationFields } from "./TrialNormalizationFields";
import { TrialTypeSelector } from "./TrialTypeSelector";

export function TrialEntryFormContent({ C, form, styles }) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <TrialEntryDatePicker C={C} recentDays={form.recentDays}
        showDatePicker={form.showDatePicker} styles={styles} trialDate={form.trialDate}
        onChangeDate={form.handleDateChange}
        onToggle={() => form.setShowDatePicker((previous) => !previous)} />
      <TrialEntryTitleField C={C} styles={styles} title={form.title}
        onChangeTitle={form.handleTitleChange} />
      <TrialNormalizationFields difficultyLevel={form.difficultyLevel}
        onDifficultyChange={form.handleDifficultyChange}
        onPublisherChange={form.handlePublisherChange}
        publisherId={form.publisherId} publishers={form.publishers} />
      <Animated.View entering={FadeInDown.delay(170).duration(420).springify()}>
        <TrialTypeSelector value={form.trialType} onChange={form.handleTypeChange} />
      </Animated.View>
      {form.trialType === "BRANCH" ? (
        <BranchSubjectPicker value={form.branchSubject} onChange={form.handleBranchChange} />
      ) : null}
      {form.showSubjectInputs ? (
        <Animated.View entering={FadeInDown.delay(240).duration(420).springify()}>
          {form.subjects.map((subject) => (
            <SubjectInput key={subject.key} subject={subject}
              values={form.values[subject.key] || EMPTY_TRIAL_SCORE}
              onChange={form.handleScoreChange(subject.key)} wrongPenalty={form.wrongPenalty} />
          ))}
        </Animated.View>
      ) : null}
      {form.showSubjectInputs ? (
        <Animated.View entering={FadeInDown.delay(310).duration(420).springify()}>
          <TotalCard totalNet={form.totalNet} />
        </Animated.View>
      ) : null}
      {form.showSubjectInputs ? (
        <Animated.View entering={FadeInDown.delay(380).duration(420).springify()}>
          <TrialEntryMoodSelector value={form.mood} onChange={form.handleMoodChange}
            C={C} styles={styles} />
        </Animated.View>
      ) : null}
      {form.showSubjectInputs ? (
        <Animated.View entering={FadeInDown.delay(450).duration(420).springify()}>
          <Button onPress={form.handleSave} loading={form.saving} icon="check" fullWidth>
            {form.saving ? "Kaydediliyor..." : "Denemeyi Kaydet"}
          </Button>
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}
