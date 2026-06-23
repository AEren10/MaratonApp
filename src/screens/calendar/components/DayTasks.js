import { useState, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { TaskInputPanel } from "./TaskInputPanel";
import * as H from "../../../lib/haptics";

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function TaskRow({ task, onToggle, onRemove, C }) {
  return (
    <Animated.View entering={FadeInDown.duration(240)} layout={Layout.springify()}>
      <Pressable
        onPress={() => { onToggle(task.id); H.tap(); }}
        style={({ pressed }) => [s.row(C), pressed && { opacity: 0.6 }]}
      >
        <View style={[s.check(C), task.done && { backgroundColor: C.success, borderColor: C.success }]}>
          {task.done && <Icon name="check" size={12} color="#FFF" sw={2.5} />}
        </View>
        <Text style={[TYPOGRAPHY.body, { color: task.done ? C.muted : C.text, flex: 1 },
          task.done && { textDecorationLine: "line-through" }
        ]} numberOfLines={2}>
          {task.title}
        </Text>
        <Pressable onPress={() => { onRemove(task.id); H.tap(); }} hitSlop={10} style={s.del}>
          <Icon name="x" size={14} color={C.muted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

export function DayTasks({ date, tasks = [], onAdd, onToggle, onRemove }) {
  const C = useC();
  const [showInput, setShowInput] = useState(false);
  const canAdd = date >= todayIso();

  const handleAdd = (title) => {
    onAdd(date, { title });
    setShowInput(false);
    H.success();
  };

  return (
    <View style={{ marginTop: SPACING.lg }}>
      <View style={{ height: 1, backgroundColor: C.border, marginBottom: SPACING.lg }} />

      <View style={s.header(C)}>
        <Text style={[TYPOGRAPHY.label, { color: C.muted }]}>GÖREVLER</Text>
        {canAdd && !showInput && (
          <Pressable onPress={() => { setShowInput(true); H.tap(); }} hitSlop={10}
            style={[s.miniAdd(C)]}>
            <Icon name="plus" size={13} color={C.accent} />
          </Pressable>
        )}
      </View>

      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          onToggle={(id) => onToggle(date, id)}
          onRemove={(id) => onRemove(date, id)}
          C={C}
        />
      ))}

      {showInput && <TaskInputPanel onAdd={handleAdd} />}

      {canAdd && !showInput && (
        <Pressable
          onPress={() => { setShowInput(true); H.tap(); }}
          style={({ pressed }) => [s.addBtn(C), { opacity: pressed ? 0.7 : 1 }]}
        >
          <View style={[s.addIcon(C)]}>
            <Icon name="plus" size={14} color="#FFF" sw={2.5} />
          </View>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.accent }]}>Görev Ekle</Text>
        </Pressable>
      )}

      {!canAdd && tasks.length === 0 && (
        <Text style={[TYPOGRAPHY.caption, { color: C.muted, textAlign: "center", paddingVertical: SPACING.sm }]}>
          Geçmiş gün — görev eklenemez
        </Text>
      )}
    </View>
  );
}

const s = {
  header: (C) => ({ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm }),
  miniAdd: (C) => ({ width: 28, height: 28, borderRadius: 14, backgroundColor: C.accentLight, alignItems: "center", justifyContent: "center" }),
  addBtn: (C) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: C.accent + "55",
  }),
  addIcon: (C) => ({ width: 26, height: 26, borderRadius: 8, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" }),
  row: (C) => ({ flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingVertical: 10, minHeight: 44 }),
  check: (C) => ({ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.border, alignItems: "center", justifyContent: "center" }),
  del: { padding: 4 },
};
