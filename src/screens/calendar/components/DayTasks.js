import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { Icon, SectionLabel } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { TaskInputPanel } from "./TaskInputPanel";
import * as H from "../../../lib/haptics";
import { todayTR } from "../../../lib/dateUtils";
import { Press } from "../../../components/design/Press";

// Satir eklenip cikinca liste zipla­masin diye.
const REFLOW = LinearTransition.duration(220);

function TaskRow({ task, onToggle, onRemove, C }) {
  return (
    <Animated.View layout={REFLOW}>
      <Press haptic="none"
        onPress={() => { onToggle(task.id); H.tap(); }}
        style={[s.row]}
      >
        <View style={[s.check, { borderColor: C.border }, task.done && { backgroundColor: C.up, borderColor: C.up }]}>
          {task.done && <Icon name="check" size={12} color={C.bg} sw={1.5} />}
        </View>
        <Text
          style={[TYPOGRAPHY.body, { color: task.done ? C.text3 : C.text, flex: 1 }, task.done && { textDecorationLine: "line-through" }]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <Press haptic="none" onPress={() => { onRemove(task.id); H.tap(); }} hitSlop={10} style={s.del}>
          <Icon name="x" size={14} color={C.text3} />
        </Press>
      </Press>
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
      <SectionLabel style={{ marginBottom: STEP.s1 }}>GÖREVLER</SectionLabel>

      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} onToggle={(id) => onToggle(date, id)} onRemove={(id) => onRemove(date, id)} C={C} />
      ))}

      {showInput ? (
        <TaskInputPanel onAdd={handleAdd} />
      ) : canAdd ? (
        <Press
          haptic="tap"
          onPress={() => setShowInput(true)}
          style={s.singleLineAdd}
          accessibilityRole="button"
          accessibilityLabel="Görev ekle"
        >
          <Icon name="plus" size={14} color={C.accent} sw={1.5} />
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.accentBright }]}>Görev ekle</Text>
        </Press>
      ) : null}
    </View>
  );
}

const s = {
  singleLineAdd: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
    paddingVertical: STEP.s2,
  },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s1, paddingVertical: 10, minHeight: 44 },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  del: { padding: 4 },
};
