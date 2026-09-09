import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../../themes/tokens";

const LEVELS = [
  { key: "easy", label: "Kolay", factor: "×0,94" },
  { key: "standard", label: "Standart", factor: "×1,00" },
  { key: "hard", label: "Zor", factor: "×1,12" },
  { key: "very_hard", label: "Çok zor", factor: "×1,22" },
];

function Choice({ active, label, detail, onPress }) {
  const C = useC();
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: active }}
      onPress={onPress} style={[styles.choice, {
        backgroundColor: active ? C.accent : C.surface,
        borderColor: active ? C.accent : C.border,
      }]}>
      <Text style={[styles.choiceText, { color: active ? C.textOnAccent : C.text }]}>{label}</Text>
      {detail ? <Text style={[styles.detail, { color: active ? C.textOnAccent : C.muted }]}>{detail}</Text> : null}
    </Pressable>
  );
}

export function TrialNormalizationFields({
  difficultyLevel, onDifficultyChange, onPublisherChange, publisherId, publishers,
}) {
  const C = useC();
  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: C.sec }]}>YAYIN</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Choice active={!publisherId} label="Belirtilmedi" onPress={() => onPublisherChange(null)} />
        {publishers.map((publisher) => (
          <Choice key={publisher.id} active={publisherId === publisher.id}
            label={publisher.name} onPress={() => onPublisherChange(publisher.id)} />
        ))}
      </ScrollView>
      <Text style={[styles.label, { color: C.sec }]}>DENEME ZORLUĞU</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {LEVELS.map((level) => (
          <Choice key={level.key} active={difficultyLevel === level.key}
            label={level.label} detail={level.factor} onPress={() => onDifficultyChange(level.key)} />
        ))}
      </ScrollView>
      <Text style={[styles.note, { color: C.muted }]}>Ham netin değişmez; karşılaştırma için normalize net ayrıca saklanır.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: SPACING.xl, gap: SPACING.sm },
  label: { ...TYPOGRAPHY.label, marginTop: SPACING.xs },
  row: { gap: SPACING.sm, paddingRight: SPACING.lg },
  choice: { minHeight: SPACING.huge, minWidth: SPACING.huge * 2, borderWidth: 1, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, alignItems: "center", justifyContent: "center" },
  choiceText: { ...TYPOGRAPHY.captionMedium },
  detail: { ...TYPOGRAPHY.micro, marginTop: SPACING.xs },
  note: { ...TYPOGRAPHY.caption },
});
