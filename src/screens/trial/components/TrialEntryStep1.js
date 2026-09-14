import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button } from "../../../components/design";
import { TrialEntryFooter } from "./TrialEntryFooter";
import { BranchSubjectPicker } from "./BranchSubjectPicker";
import { TrialDifficultyNote } from "./TrialDifficultyNote";
import { TrialNormalizationFields } from "./TrialNormalizationFields";
import { TrialTypeSelector } from "./TrialTypeSelector";

// Deneme Gir 1/3: deneme turu, yayin ve zorluk.
export function TrialEntryStep1({ form, styles, onNext }) {
  const publisherName = form.publishers.find((p) => p.id === form.publisherId)?.name || null;
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(500)}>
          <TrialTypeSelector value={form.trialType} onChange={form.handleTypeChange} />
        </Animated.View>
        {form.trialType === "BRANCH" ? (
          <BranchSubjectPicker value={form.branchSubject} onChange={form.handleBranchChange} />
        ) : null}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.section}>
          <Text style={styles.title}>Hangi denemeyi girdin?</Text>
          <Text style={styles.body}>
            Yayını seç, zorluğunu sen işaretle. Netini o çarpanla normalize edip rotaya işleriz.
          </Text>
        </Animated.View>
        <TrialNormalizationFields difficultyLevel={form.difficultyLevel}
          onDifficultyChange={form.handleDifficultyChange}
          onPublisherChange={form.handlePublisherChange}
          publisherId={form.publisherId} publishers={form.publishers} />
        <TrialDifficultyNote difficultyLevel={form.difficultyLevel} publisherName={publisherName} styles={styles} />
      </ScrollView>
        <TrialEntryFooter>
          <Button size="lg" onPress={onNext} fullWidth
            disabled={form.trialType === "BRANCH" && !form.branchSubject}>
            Netleri gir
          </Button>
        </TrialEntryFooter>
    </View>
  );
}
