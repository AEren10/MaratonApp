import { useState, useMemo } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import * as H from "../../../lib/haptics";

const PRESETS = [
  { label: "Ders çalış", icon: "play", colorKey: "accent" },
  { label: "Deneme gir", icon: "chart", colorKey: "blue" },
  { label: "Tekrar yap", icon: "refresh", colorKey: "teal" },
];

export function TaskInputPanel({ onAdd }) {
  const C = useC();
  const s = useMemo(() => styles(C), [C]);
  const [text, setText] = useState("");

  const submit = (title) => {
    if (!title?.trim()) return;
    onAdd(title.trim());
    setText("");
  };

  return (
    <Animated.View entering={FadeInDown.duration(240)} style={s.panel}>
      <View style={s.presetRow}>
        {PRESETS.map((p) => (
          <Pressable
            key={p.label}
            onPress={() => { submit(p.label); H.tap(); }}
            style={({ pressed }) => [s.preset, { borderColor: C[p.colorKey] + "50", opacity: pressed ? 0.7 : 1 }]}
          >
            <Icon name={p.icon} size={13} color={C[p.colorKey]} />
            <Text style={[s.presetText, { color: C[p.colorKey] }]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Kendi görevini yaz..."
          placeholderTextColor={C.muted}
          style={s.input}
          onSubmitEditing={() => submit(text)}
          returnKeyType="done"
          autoFocus
        />
        <Pressable
          onPress={() => submit(text)}
          hitSlop={8}
          style={[s.submitBtn, { backgroundColor: text.trim() ? C.accent : C.surface2 }]}
        >
          <Icon name="check" size={16} color={text.trim() ? C.textOnFill : C.muted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = (C) => ({
  panel: { marginTop: SPACING.sm, gap: SPACING.sm },
  presetRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  preset: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    backgroundColor: C.surface2,
  },
  presetText: { ...TYPOGRAPHY.captionMedium },
  inputRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: C.text,
    backgroundColor: C.surface2,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: C.border,
  },
  submitBtn: { width: 38, height: 38, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center" },
});
