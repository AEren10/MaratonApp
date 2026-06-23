import { useState, useMemo } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import * as H from "../../../lib/haptics";

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

const PRESETS = [
  { label: "Ders çalış", icon: "play", color: "accent" },
  { label: "Deneme gir", icon: "chart", color: "blue" },
  { label: "Tekrar yap", icon: "refresh", color: "teal" },
];

export function DayTasks({ date, tasks = [], onAdd, onToggle, onRemove }) {
  const C = useC();
  const s = useMemo(() => styles(C), [C]);
  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState("");
  const canAdd = date >= todayIso();

  const handleAdd = (title) => {
    if (!title?.trim()) return;
    onAdd(date, { title: title.trim() });
    setText("");
    setShowInput(false);
    H.success();
  };

  return (
    <View style={{ marginTop: SPACING.lg }}>
      <View style={s.header}>
        <Text style={s.section}>GÖREVLER</Text>
        {canAdd && (
          <Pressable onPress={() => setShowInput((p) => !p)} hitSlop={8} style={s.addBtn}>
            <Icon name="plus" size={14} color={C.accent} />
            <Text style={s.addText}>Ekle</Text>
          </Pressable>
        )}
      </View>

      {tasks.map((t) => (
        <Pressable key={t.id} onPress={() => { onToggle(date, t.id); H.tap(); }} onLongPress={() => { onRemove(date, t.id); H.tap(); }} style={s.taskRow}>
          <Icon name={t.done ? "checkCircle" : "circle"} size={20} color={t.done ? C.green : C.muted} sw={2} />
          <Text style={[s.taskText, t.done && s.taskDone]}>{t.title}</Text>
        </Pressable>
      ))}

      {showInput && (
        <View style={{ marginTop: SPACING.sm, gap: SPACING.sm }}>
          <View style={s.presetRow}>
            {PRESETS.map((p) => (
              <Pressable key={p.label} onPress={() => handleAdd(p.label)} style={[s.preset, { borderColor: C[p.color] + "40" }]}>
                <Icon name={p.icon} size={14} color={C[p.color]} />
                <Text style={[s.presetText, { color: C[p.color] }]}>{p.label}</Text>
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
              onSubmitEditing={() => handleAdd(text)}
              returnKeyType="done"
              autoFocus
            />
            <Pressable onPress={() => handleAdd(text)} hitSlop={8} style={[s.submitBtn, { backgroundColor: text.trim() ? C.accent : C.surface2 }]}>
              <Icon name="check" size={16} color={text.trim() ? "#FFF" : C.muted} />
            </Pressable>
          </View>
        </View>
      )}

      {tasks.length === 0 && !showInput && canAdd && (
        <Text style={s.empty}>Henüz görev yok — ekle ile planla</Text>
      )}
    </View>
  );
}

const styles = (C) => ({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm },
  section: { ...TYPOGRAPHY.label, color: C.muted },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addText: { ...TYPOGRAPHY.captionMedium, color: C.accent },
  taskRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingVertical: SPACING.sm },
  taskText: { ...TYPOGRAPHY.bodySemiBold, color: C.text, flex: 1 },
  taskDone: { textDecorationLine: "line-through", color: C.muted },
  presetRow: { flexDirection: "row", gap: SPACING.sm },
  preset: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: RADIUS.md, borderWidth: 1, backgroundColor: C.surface },
  presetText: { ...TYPOGRAPHY.captionMedium },
  inputRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  input: { flex: 1, ...TYPOGRAPHY.body, color: C.text, backgroundColor: C.surface2, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: C.border },
  submitBtn: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  empty: { ...TYPOGRAPHY.caption, color: C.muted, textAlign: "center", paddingVertical: SPACING.md },
});
