import { useMemo, useCallback } from "react";
import {
  ScrollView, View, Text, Pressable,
  KeyboardAvoidingView, Platform,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, Button } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { EMPTY_TRIAL_SCORE } from "../../domain/trial/trialEntryModel";
import { SubjectInput } from "./components/SubjectInput";
import { TotalCard } from "./components/TotalCard";
import { TrialTypeSelector } from "./components/TrialTypeSelector";
import { BranchSubjectPicker } from "./components/BranchSubjectPicker";
import { XPBoostToast } from "../../components/common/XPBoostToast";
import { TrialEntryDatePicker } from "./components/TrialEntryDatePicker";
import { TrialEntryMoodSelector } from "./components/TrialEntryMoodSelector";
import { TrialEntryTitleField } from "./components/TrialEntryTitleField";
import { useTrialEntryForm } from "./useTrialEntryForm";

export default function TrialEntryScreen() {
  const navigation = useNavigation();
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const trialEntry = useTrialEntryForm({ C, navigation });
  const {
    branchSubject,
    dismissXP,
    handleBranchChange,
    handleDateChange,
    handleMoodChange,
    handleSave,
    handleScoreChange,
    handleTitleChange,
    handleTypeChange,
    mood,
    recentDays,
    saving,
    setShowDatePicker,
    showDatePicker,
    showSubjectInputs,
    subjects,
    title,
    totalNet,
    trialDate,
    trialType,
    values,
    wrongPenalty,
    xpToast,
  } = trialEntry;

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
            <Icon name="arrowL" size={22} color={C.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Deneme Gir</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TrialEntryDatePicker
            C={C}
            recentDays={recentDays}
            showDatePicker={showDatePicker}
            styles={styles}
            trialDate={trialDate}
            onChangeDate={handleDateChange}
            onToggle={() => setShowDatePicker((prev) => !prev)}
          />

          <TrialEntryTitleField
            C={C}
            styles={styles}
            title={title}
            onChangeTitle={handleTitleChange}
          />

          <Animated.View entering={FadeInDown.delay(170).duration(420).springify()}>
            <TrialTypeSelector value={trialType} onChange={handleTypeChange} />
          </Animated.View>

          {trialType === "BRANCH" && (
            <BranchSubjectPicker value={branchSubject} onChange={handleBranchChange} />
          )}

          {showSubjectInputs && (
            <Animated.View entering={FadeInDown.delay(240).duration(420).springify()}>
              {subjects.map((s) => (
                <SubjectInput
                  key={s.key}
                  subject={s}
                  values={values[s.key] || EMPTY_TRIAL_SCORE}
                  onChange={handleScoreChange(s.key)}
                  wrongPenalty={wrongPenalty}
                />
              ))}
            </Animated.View>
          )}

          {showSubjectInputs && (
            <Animated.View entering={FadeInDown.delay(310).duration(420).springify()}>
              <TotalCard totalNet={totalNet} />
            </Animated.View>
          )}

          {showSubjectInputs && (
            <Animated.View entering={FadeInDown.delay(380).duration(420).springify()}>
              <TrialEntryMoodSelector
                value={mood}
                onChange={handleMoodChange}
                C={C}
                styles={styles}
              />
            </Animated.View>
          )}

          {showSubjectInputs && (
            <Animated.View entering={FadeInDown.delay(450).duration(420).springify()}>
              <Button onPress={handleSave} loading={saving} icon="check" fullWidth>
                {saving ? "Kaydediliyor..." : "Denemeyi Kaydet"}
              </Button>
            </Animated.View>
          )}
        </ScrollView>
        <XPBoostToast amount={xpToast.amount} visible={xpToast.visible} multiplier={xpToast.multiplier} onDismiss={dismissXP} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (C) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.subheading,
    color: C.text,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 60,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  dateText: {
    ...TYPOGRAPHY.bodyMedium,
    color: C.sec,
    flex: 1,
  },
  datePicker: {
    flexDirection: "row",
    gap: 8,
    marginBottom: SPACING.lg,
    flexWrap: "wrap",
  },
  dateChip: {
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 52,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 2,
    marginBottom: SPACING.lg,
  },
  titleInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: C.text,
    paddingVertical: 12,
  },
  moodWrap: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  moodTitle: {
    ...TYPOGRAPHY.captionMedium,
    color: C.sec,
    marginBottom: SPACING.sm,
  },
  moodRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  moodBtn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: SPACING.md,
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: C.border,
  },
  moodBtnActive: {
    borderColor: C.accent,
    backgroundColor: C.accent + "18",
  },
  moodLabel: {
    ...TYPOGRAPHY.micro,
    color: C.muted,
  },
});
