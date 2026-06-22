import { View, Text, TextInput } from "react-native";
import { useState } from "react";
import { SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { DurationPicker } from "./DurationPicker";
import { QuestionStepper } from "./QuestionStepper";

function Label({ children, C }) {
  return (
    <Text
      style={{
        fontFamily: "Inter_600SemiBold",
        fontSize: 12,
        color: C.sec,
        marginTop: 18,
        marginBottom: 8,
        letterSpacing: 0.4,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Text>
  );
}

export function StudyForm({ form, setForm }) {
  const C = useC();
  const [topicFocused, setTopicFocused] = useState(false);
  const [notesFocused, setNotesFocused] = useState(false);

  return (
    <View>
      <Label C={C}>Konu</Label>
      <TextInput
        value={form.topic}
        onChangeText={(t) => setForm((p) => ({ ...p, topic: t }))}
        placeholder="ör. Paragraf, Türev, Genetik..."
        placeholderTextColor={C.muted}
        onFocus={() => setTopicFocused(true)}
        onBlur={() => setTopicFocused(false)}
        style={{
          backgroundColor: C.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: topicFocused ? C.accent : C.border,
          paddingHorizontal: 14,
          paddingVertical: 14,
          fontFamily: "Inter_400Regular",
          fontSize: 15,
          color: C.text,
        }}
      />

      <Label C={C}>Soru Sayisi</Label>
      <QuestionStepper
        value={form.questionCount}
        onChange={(v) => setForm((p) => ({ ...p, questionCount: v }))}
      />

      <Label C={C}>Sure</Label>
      <DurationPicker
        selected={form.duration}
        onSelect={(v) => setForm((p) => ({ ...p, duration: v }))}
      />

      <Label C={C}>Not (opsiyonel)</Label>
      <TextInput
        value={form.notes}
        onChangeText={(t) => setForm((p) => ({ ...p, notes: t }))}
        placeholder="Bu oturum hakkinda notlar..."
        placeholderTextColor={C.muted}
        multiline
        onFocus={() => setNotesFocused(true)}
        onBlur={() => setNotesFocused(false)}
        style={{
          backgroundColor: C.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: notesFocused ? C.accent : C.border,
          paddingHorizontal: 14,
          paddingVertical: 14,
          fontFamily: "Inter_400Regular",
          fontSize: 15,
          color: C.text,
          minHeight: 90,
          textAlignVertical: "top",
          paddingTop: 12,
        }}
      />
    </View>
  );
}
