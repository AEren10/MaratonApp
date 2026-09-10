import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { SPACING, TYPOGRAPHY } from "../../../themes/tokens";
import { trialDifficultyMultiplier } from "../../../domain/trial/trialModel";
import { TotalCard } from "./TotalCard";
import { TrialEntryDatePicker } from "./TrialEntryDatePicker";
import { TrialEntryTitleField } from "./TrialEntryTitleField";
import { TrialEntryMoodSelector } from "./TrialEntryMoodSelector";

const LEVEL_LABELS = { easy: "×0,94", standard: "×1,00", hard: "×1,12", very_hard: "×1,22" };

// Deneme Gir 3/3: son kontrol, kaydet ve rotayi ciz.
export function TrialEntryStep3({ form, styles, onBack }) {
  const C = useC();
  const multiplier = trialDifficultyMultiplier(form.difficultyLevel);
  const normalizedNet = useMemo(
    () => (Number(form.totalNet) * multiplier).toFixed(2),
    [form.totalNet, multiplier],
  );

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.huge }}
      showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={[TYPOGRAPHY.subheading, { color: C.text, marginBottom: SPACING.xs }]}>
        Son kontrol
      </Text>
      <Text style={[TYPOGRAPHY.caption, { color: C.sec, marginBottom: SPACING.xl }]}>
        Kaydettiğinde rota yeniden çizilir ve tahminin güncellenir.
      </Text>
      <Animated.View entering={FadeInDown.delay(80).duration(420).springify()}>
        <TotalCard totalNet={form.totalNet} normalizedNet={normalizedNet}
          multiplierLabel={`rota bunu kullanır · ${LEVEL_LABELS[form.difficultyLevel] || "×1,00"}`} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(140).duration(420).springify()}>
        <TrialEntryTitleField C={C} styles={styles} title={form.title} onChangeTitle={form.handleTitleChange} />
      </Animated.View>
      <TrialEntryDatePicker C={C} recentDays={form.recentDays} showDatePicker={form.showDatePicker}
        styles={styles} trialDate={form.trialDate} onChangeDate={form.handleDateChange}
        onToggle={() => form.setShowDatePicker((previous) => !previous)} />
      <Animated.View entering={FadeInDown.delay(200).duration(420).springify()}>
        <TrialEntryMoodSelector C={C} styles={styles} value={form.mood} onChange={form.handleMoodChange} />
      </Animated.View>
      <View style={{ marginTop: SPACING.xl, gap: SPACING.sm }}>
        <Button size="lg" onPress={form.handleSave} loading={form.saving} icon="check" fullWidth>
          {form.saving ? "Kaydediliyor..." : "Kaydet ve rotayı çiz"}
        </Button>
        <Button size="md" variant="ghost" onPress={onBack} fullWidth>
          Adım 2'ye dön
        </Button>
      </View>
    </ScrollView>
  );
}
