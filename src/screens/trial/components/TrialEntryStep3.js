import { useMemo } from "react";
import { ScrollView, Text } from "react-native";
import Animated from "react-native-reanimated";

import { Button } from "../../../components/design";
import { buildTrialSubjectScores } from "../../../domain/trial/trialEntryModel";
import { trialDifficultyMultiplier } from "../../../domain/trial/trialModel";
import { TrialEntryDetailsCard } from "./TrialEntryDetailsCard";
import { TrialEntryNetCard } from "./TrialEntryNetCard";
import { Press } from "../../../components/design/Press";

export function TrialEntryStep3({ form, styles, onBack }) {
  const normalizedNet = Number(form.totalNet) * trialDifficultyMultiplier(form.difficultyLevel);
  const publisherName = form.publishers?.find((p) => p.id === form.publisherId)?.name || null;

  const { subjectsMap } = useMemo(
    () => buildTrialSubjectScores(form.subjects, form.values, form.wrongPenalty),
    [form.subjects, form.values, form.wrongPenalty],
  );

  const subjectBreakdown = useMemo(() => {
    return (form.subjects || []).map((s) => ({
      key: s.key,
      name: s.name,
      color: s.color,
      net: subjectsMap[s.key]?.net ?? 0,
    }));
  }, [form.subjects, subjectsMap]);

  return (
    <ScrollView contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Animated.View>
        <Text style={styles.title}>Son kontrol</Text>
        <Text style={styles.body}>Kaydettiğinde rota yeniden çizilir ve tahminin güncellenir.</Text>
      </Animated.View>
      <Animated.View style={styles.section}>
        <TrialEntryNetCard
          totalNet={Number(form.totalNet)}
          normalizedNet={normalizedNet}
          difficultyLevel={form.difficultyLevel}
          publisherName={publisherName}
          subjectBreakdown={subjectBreakdown}
          styles={styles}
        />
      </Animated.View>
      <Animated.View style={styles.section}>
        <TrialEntryDetailsCard form={form} styles={styles} />
      </Animated.View>
      <Animated.View style={styles.actions}>
        <Button size="lg" onPress={form.handleSave} loading={form.saving} fullWidth>
          Kaydet ve rotayı çiz
        </Button>
        <Press haptic="none" onPress={onBack} style={styles.tertiary} accessibilityRole="button">
          <Text style={styles.tertiaryText}>Adım 2'ye dön</Text>
        </Press>
      </Animated.View>
    </ScrollView>
  );
}
