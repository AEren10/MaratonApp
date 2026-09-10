import { View, Text, Pressable, TextInput } from "react-native";

import { Icon, SectionLabel } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";

export function SaveTopicQuestionSection({
  C,
  topic,
  onOpenTopicPicker,
  questionCount,
  onChangeQuestionCount,
  correctCount,
  onChangeCorrectCount,
}) {
  return (
    <>
      <View style={{ marginTop: STEP.s4 }}>
        <SectionLabel>KONU (isteğe bağlı)</SectionLabel>
        <Pressable
          onPress={onOpenTopicPicker}
          accessibilityRole="button"
          accessibilityLabel="Konu seç"
          style={{
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            height: CONTROL.buttonPrimary, paddingHorizontal: STEP.s3,
            borderRadius: SHAPE.card, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface,
          }}
        >
          <Text style={[TYPOGRAPHY.bodyMedium, { color: topic ? C.text : C.text3, flexShrink: 1 }]} numberOfLines={1}>
            {topic || "Konu seç..."}
          </Text>
          <Icon name="chevDown" size={14} color={C.text3} />
        </Pressable>
      </View>

      <View style={{ marginTop: STEP.s4 }}>
        <SectionLabel>SORU SAYISI (isteğe bağlı)</SectionLabel>
        <View style={{ flexDirection: "row", gap: STEP.s2 }}>
          <TextInput
            style={[styles.input(C), { flex: 1 }]}
            placeholder="0"
            placeholderTextColor={C.text3}
            keyboardType="number-pad"
            value={questionCount}
            onChangeText={onChangeQuestionCount}
            accessibilityLabel="Çözülen soru sayısı"
          />
          <TextInput
            style={[styles.input(C), { flex: 1 }]}
            placeholder="Doğru"
            placeholderTextColor={C.text3}
            keyboardType="number-pad"
            value={correctCount}
            onChangeText={onChangeCorrectCount}
            accessibilityLabel="Doğru sayısı"
          />
        </View>
      </View>
    </>
  );
}

const styles = {
  input: (C) => ({
    ...TYPOGRAPHY.body,
    color: C.text,
    borderRadius: SHAPE.card,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    paddingHorizontal: STEP.s2,
    paddingVertical: STEP.s2,
  }),
};
