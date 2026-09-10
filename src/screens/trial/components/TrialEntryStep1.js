import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { SPACING, TYPOGRAPHY } from "../../../themes/tokens";
import { BranchSubjectPicker } from "./BranchSubjectPicker";
import { TrialNormalizationFields } from "./TrialNormalizationFields";
import { TrialTypeSelector } from "./TrialTypeSelector";

// Deneme Gir 1/3: deneme turu, yayin ve zorluk.
export function TrialEntryStep1({ form, onNext }) {
  const C = useC();
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.huge }}
      showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={[TYPOGRAPHY.subheading, { color: C.text, marginBottom: SPACING.xs }]}>
        Hangi denemeyi girdin?
      </Text>
      <Text style={[TYPOGRAPHY.caption, { color: C.sec, marginBottom: SPACING.xl }]}>
        Yayını seç, zorluğunu sen işaretle. Netini o çarpanla normalize edip rotaya işleriz.
      </Text>
      <Animated.View entering={FadeInDown.delay(80).duration(420).springify()}>
        <TrialTypeSelector value={form.trialType} onChange={form.handleTypeChange} />
      </Animated.View>
      {form.trialType === "BRANCH" ? (
        <BranchSubjectPicker value={form.branchSubject} onChange={form.handleBranchChange} />
      ) : null}
      <Animated.View entering={FadeInDown.delay(150).duration(420).springify()}>
        <TrialNormalizationFields difficultyLevel={form.difficultyLevel}
          onDifficultyChange={form.handleDifficultyChange}
          onPublisherChange={form.handlePublisherChange}
          publisherId={form.publisherId} publishers={form.publishers} />
      </Animated.View>
      <View style={{ marginTop: SPACING.md }}>
        <Button size="lg" onPress={onNext} fullWidth
          disabled={form.trialType === "BRANCH" && !form.branchSubject}>
          Devam
        </Button>
      </View>
    </ScrollView>
  );
}
