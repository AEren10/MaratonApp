import { useState, useMemo } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import * as H from "../../../lib/haptics";

const PRESETS = [
  { label: "Ders çalış", icon: "play" },
  { label: "Deneme gir", icon: "chart" },
  { label: "Tekrar yap", icon: "refresh" },
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
            style={({ pressed }) => [s.preset, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Icon name={p.icon} size={13} color={C.accent} />
            <Text style={[s.presetText, { color: C.accent }]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Kendi görevini yaz..."
          placeholderTextColor={C.text3}
          style={s.input}
          onSubmitEditing={() => submit(text)}
          returnKeyType="done"
          autoFocus
        />
        <Pressable
          onPress={() => submit(text)}
          hitSlop={8}
          accessibilityLabel="Görevi ekle"
          accessibilityRole="button"
          style={[s.submitBtn, { backgroundColor: text.trim() ? C.accent : C.elev }]}
        >
          <Icon name="check" size={16} color={text.trim() ? C.accentInk : C.text3} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = (C) => ({
  panel: { marginTop: STEP.s1, gap: STEP.s1 },
  presetRow: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1 },
  preset: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: STEP.s1,
    paddingVertical: 6,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.elev,
  },
  presetText: { ...TYPOGRAPHY.captionMedium },
  inputRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: C.text,
    backgroundColor: C.elev,
    borderRadius: SHAPE.cardTight,
    paddingHorizontal: STEP.s2,
    paddingVertical: STEP.s1,
    borderWidth: 1,
    borderColor: C.border,
  },
  submitBtn: { width: 38, height: 38, borderRadius: SHAPE.cardTight, alignItems: "center", justifyContent: "center" },
});
