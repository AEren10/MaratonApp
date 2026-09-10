import { View, Text, TextInput } from "react-native";

import { SectionLabel } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

export function SaveNotesSection({ C, notes, onChangeNotes }) {
  return (
    <View style={{ marginTop: STEP.s4 }}>
      <SectionLabel>NOT (isteğe bağlı)</SectionLabel>
      <TextInput
        value={notes}
        onChangeText={onChangeNotes}
        placeholder="Kendine bir not bırak..."
        placeholderTextColor={C.text3}
        multiline
        maxLength={140}
        accessibilityLabel="Oturum notu"
        style={{
          ...TYPOGRAPHY.body,
          color: C.text,
          borderRadius: SHAPE.card,
          borderWidth: 1,
          borderColor: C.border,
          backgroundColor: C.surface,
          paddingHorizontal: STEP.s2,
          paddingVertical: STEP.s2,
          minHeight: 80,
          textAlignVertical: "top",
        }}
      />
      <Text style={[TYPOGRAPHY.micro, { color: C.text3, textAlign: "right", marginTop: STEP.s1 / 2 }]}>
        {notes.length}/140
      </Text>
    </View>
  );
}
