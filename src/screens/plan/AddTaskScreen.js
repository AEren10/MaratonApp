import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon, Button } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { AddTaskSubjectRow } from "./components/AddTaskSubjectRow";
import { AddTaskExamSegment } from "./components/AddTaskExamSegment";
import { TopicPickerModal } from "./components/TopicPickerModal";
import { ADD_TASK_DURATIONS } from "./addTaskOptions";
import { useAddTaskState } from "./useAddTaskState";

function SectionHeader({ title, C }) {
  return (
    <Text style={[TYPOGRAPHY.label, { color: C.text2, letterSpacing: 1, marginTop: STEP.s4, marginBottom: STEP.s2 }]}>
      {title}
    </Text>
  );
}

function Pill({ label, selected, onPress, C }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.pill, { borderColor: selected ? C.accent : C.elev, backgroundColor: selected ? C.brandTint : C.surface }]}
    >
      <Text style={[TYPOGRAPHY.metaSemiBold, { color: selected ? C.text : C.text3 }]}>{label}</Text>
    </Pressable>
  );
}

function AddTaskInner() {
  const C = useC();
  const state = useAddTaskState();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.header}>
        <Pressable onPress={() => state.navigation.goBack()} hitSlop={STEP.s2} style={s.backRow}>
          <Icon name="chevL" size={18} color={C.text} />
          <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Durak ekle</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <SectionHeader title="DERS" C={C} />
        <AddTaskExamSegment value={state.examTab} onChange={state.handleExamChange} C={C} />
        <View style={{ borderTopWidth: 1, borderTopColor: C.line }}>
          {state.subjects.map((sub) => (
            <AddTaskSubjectRow
              key={sub.key}
              subject={sub}
              selected={state.subjectKey === sub.key}
              onPress={() => state.handleSubjectSelect(sub.key)}
              C={C}
            />
          ))}
        </View>

        <SectionHeader title="KONU" C={C} />
        <Pressable
          onPress={() => state.setPickerOpen(true)}
          style={[s.picker, { backgroundColor: C.surface, borderColor: C.elev }]}
          accessibilityRole="button"
          accessibilityLabel="Konu seç"
        >
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: state.topicName ? C.text : C.text3, flex: 1 }]}>
            {state.topicName || "Konu seçin..."}
          </Text>
          <Icon name="chevR" size={16} color={C.text3} />
        </Pressable>

        <SectionHeader title="SÜRE" C={C} />
        <View style={s.pillsRow}>
          {ADD_TASK_DURATIONS.map((d) => (
            <Pill key={d} label={d} selected={state.durVal === d} onPress={() => state.setDurVal(d)} C={C} />
          ))}
        </View>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s2 }]}>
          {state.durVal === "Belirtme" ? "Süre sınırı olmadan bugünün planına eklenir." : "Bugünün planına eklenir."}
        </Text>
      </ScrollView>

      <View style={[s.bottomAction, { backgroundColor: C.bg }]}>
        <Button variant="primary" size="lg" fullWidth onPress={state.handleSubmit}>
          Rotaya ekle
        </Button>
      </View>

      <TopicPickerModal
        visible={state.pickerOpen}
        onClose={() => state.setPickerOpen(false)}
        onSelect={(t) => state.setTopicName(t)}
        subjectLabel={state.selectedSubjectObj?.name || ""}
        topics={state.currentTopics}
        C={C}
      />
    </SafeAreaView>
  );
}

export default function AddTaskScreen() {
  return (
    <ScreenErrorBoundary screenName="AddTaskScreen">
      <AddTaskInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s2 },
  backRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: STEP.s5 * 2 + STEP.s3 },
  picker: { flexDirection: "row", alignItems: "center", paddingHorizontal: STEP.s3, height: 52, borderRadius: SHAPE.panel, borderWidth: 1 },
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s2 },
  pill: { flex: 1, minWidth: "18%", height: 44, borderRadius: SHAPE.chip, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  bottomAction: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: GUTTER, paddingBottom: STEP.s4, paddingTop: STEP.s3 },
});
