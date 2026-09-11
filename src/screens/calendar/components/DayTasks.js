import { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { Icon, SectionLabel } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { TaskInputPanel } from "./TaskInputPanel";
import * as H from "../../../lib/haptics";
import { todayTR } from "../../../lib/dateUtils";

function TaskRow({ task, onToggle, onRemove, C }) {
  return (
    <Animated.View entering={FadeInDown.duration(240)} layout={Layout.springify()}>
      <Pressable
        onPress={() => { onToggle(task.id); H.tap(); }}
        style={({ pressed }) => [s.row, pressed && { opacity: 0.6 }]}
      >
        <View style={[s.check, { borderColor: C.border }, task.done && { backgroundColor: C.up, borderColor: C.up }]}>
          {task.done && <Icon name="check" size={12} color={C.bg} sw={2.5} />}
        </View>
        <Text
          style={[TYPOGRAPHY.body, { color: task.done ? C.text3 : C.text, flex: 1 }, task.done && { textDecorationLine: "line-through" }]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <Pressable onPress={() => { onRemove(task.id); H.tap(); }} hitSlop={10} style={s.del}>
          <Icon name="x" size={14} color={C.text3} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

export function DayTasks({ date, tasks = [], onAdd, onToggle, onRemove, autoOpen = false }) {
  const C = useC();
  const [showInput, setShowInput] = useState(autoOpen);
  const canAdd = date >= todayTR();

  useEffect(() => { if (autoOpen) setShowInput(true); }, [autoOpen]);

  const handleAdd = (title) => {
    onAdd(date, { title });
    setShowInput(false);
    H.success();
  };

  return (
    <View style={{ marginTop: STEP.s3 }}>
      <View style={{ height: 1, backgroundColor: C.line, marginBottom: STEP.s2 }} />

      <View style={s.header}>
        <SectionLabel style={{ marginBottom: 0 }}>GÖREVLER</SectionLabel>
        {canAdd && !showInput && (
          <Pressable onPress={() => { setShowInput(true); H.tap(); }} hitSlop={10} style={[s.miniAdd, { backgroundColor: C.brandTint }]}>
            <Icon name="plus" size={13} color={C.accent} />
          </Pressable>
        )}
      </View>

      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} onToggle={(id) => onToggle(date, id)} onRemove={(id) => onRemove(date, id)} C={C} />
      ))}

      {showInput && <TaskInputPanel onAdd={handleAdd} />}

      {canAdd && !showInput && (
        <Pressable onPress={() => { setShowInput(true); H.tap(); }} style={({ pressed }) => [s.addBtn, { borderColor: C.accent + "55", opacity: pressed ? 0.7 : 1 }]}>
          <View style={[s.addIcon, { backgroundColor: C.accent }]}>
            <Icon name="plus" size={14} color={C.accentInk} sw={2.5} />
          </View>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.accent }]}>Görev Ekle</Text>
        </Pressable>
      )}

      {!canAdd && tasks.length === 0 && (
        <Text style={[TYPOGRAPHY.caption, { color: C.text3, textAlign: "center", paddingVertical: STEP.s1 }]}>
          Geçmiş gün — görev eklenemez
        </Text>
      )}
    </View>
  );
}

const s = {
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: STEP.s1 },
  miniAdd: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
    marginTop: STEP.s2,
    paddingVertical: STEP.s2,
    paddingHorizontal: STEP.s3,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  addIcon: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s1, paddingVertical: 10, minHeight: 44 },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  del: { padding: 4 },
};
