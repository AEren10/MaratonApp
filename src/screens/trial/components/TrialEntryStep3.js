import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useState } from "react";

import { Button } from "../../../components/design";
import { trialDifficultyMultiplier } from "../../../domain/trial/trialModel";
import { TrialEntryDetailsCard, TrialEntryNotebookToggle } from "./TrialEntryDetailsCard";
import { TrialEntryNetCard } from "./TrialEntryNetCard";

export function TrialEntryStep3({ form, styles, onBack }) {
  const normalizedNet = Number(form.totalNet) * trialDifficultyMultiplier(form.difficultyLevel);
  const publisherName = form.publishers?.find((p) => p.id === form.publisherId)?.name || null;
  const [addWrong, setAddWrong] = useState(true);
  
  // Hesaplanan yanlis sayisi
  const totalWrong = Object.values(form.values || {}).reduce(
    (acc, sec) => acc + (parseInt(sec?.wrong, 10) || 0),
    0,
  );

  return (
    <ScrollView contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Animated.View entering={FadeInDown.duration(500)}>
        <Text style={styles.title}>Son kontrol</Text>
        <Text style={styles.body}>Kaydettiğinde rota yeniden çizilir ve tahminin güncellenir.</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(70).duration(500)} style={styles.section}>
        <TrialEntryNetCard totalNet={Number(form.totalNet)} normalizedNet={normalizedNet}
          difficultyLevel={form.difficultyLevel} publisherName={publisherName} styles={styles} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(140).duration(500)} style={styles.section}>
        <TrialEntryDetailsCard form={form} styles={styles} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(210).duration(500)} style={styles.section}>
        <TrialEntryNotebookToggle value={addWrong} onValueChange={setAddWrong} count={totalWrong} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(280).duration(500)} style={styles.actions}>
        <Button size="lg" onPress={form.handleSave} loading={form.saving} fullWidth>
          Kaydet ve rotayı çiz
        </Button>
        <Pressable onPress={onBack} style={styles.tertiary} accessibilityRole="button">
          <Text style={styles.tertiaryText}>Adım 2'ye dön</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}
