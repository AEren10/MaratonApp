import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Icon, Button } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";
import { useUserTasks } from "../../hooks/useUserTasks";
import { AddTaskSubjectRow } from "./components/AddTaskSubjectRow";
import { ADD_TASK_DURATIONS, ADD_TASK_SUBJECTS, parseDurationMinutes } from "./addTaskOptions";

function SectionHeader({ title, C }) {
  return (
    <Text style={[TYPOGRAPHY.label, { color: C.text2, letterSpacing: 1, marginTop: STEP.s5, marginBottom: STEP.s3 }]}>
      {title}
    </Text>
  );
}

function Pill({ label, selected, onPress, C }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.pill,
        {
          borderColor: selected ? C.accent : C.elev,
          backgroundColor: selected ? C.brandTint : C.surface,
        },
      ]}
    >
      <Text style={[TYPOGRAPHY.metaSemiBold, { color: selected ? C.text : C.text3 }]}>{label}</Text>
    </Pressable>
  );
}

function AddTaskInner() {
  const navigation = useNavigation();
  const route = useRoute();
  const C = useC();
  const { createTask } = useUserTasks();
  const showAlert = useAlert();

  const initialSubject = route.params?.subjectKey || route.params?.preSubject;
  const initialTopic = route.params?.topicName;
  const [subjectKey, setSubjectKey] = useState(initialSubject || "matematik");
  const [topicName] = useState(initialTopic || "Genel çalışma");
  const [durVal, setDurVal] = useState("50 dk");

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={s.backRow}>
          <Icon name="chevL" size={18} color={C.text} />
          <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Durak ekle</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <SectionHeader title="DERS" C={C} />
        <View style={{ borderTopWidth: 1, borderTopColor: C.line }}>
          {ADD_TASK_SUBJECTS.map((sub) => (
            <AddTaskSubjectRow
              key={sub.key}
              subject={sub}
              selected={subjectKey === sub.key}
              onPress={() => setSubjectKey(sub.key)}
              C={C}
            />
          ))}
        </View>

        <SectionHeader title="KONU" C={C} />
        <View style={[s.picker, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text, flex: 1 }]}>{topicName}</Text>
        </View>

        <SectionHeader title="SÜRE" C={C} />
        <View style={s.pillsRow}>
          {ADD_TASK_DURATIONS.map((d) => (
            <Pill
              key={d}
              label={d}
              selected={durVal === d}
              onPress={() => setDurVal(d)}
              C={C}
            />
          ))}
        </View>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s3 }]}>
          Bugünün planına eklenir. Farklı gün/saat seçimi takvimden yapılır.
        </Text>
      </ScrollView>

      <View style={[s.bottomAction, { backgroundColor: C.bg }]}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={async () => {
            try {
              await createTask({
                subject: subjectKey,
                topic: topicName,
                targetMinutes: parseDurationMinutes(durVal),
                note: "Kullanıcı ekledi",
              });
              H.success();
              navigation.goBack();
            } catch (e) {
              showAlert("Durak eklenemedi", e?.message || "Bilgileri kontrol edip tekrar dene.");
            }
          }}
        >
          Rotaya ekle
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default function AddTaskScreen() {
  return (
    <ScreenErrorBoundary>
      <AddTaskInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s2 },
  backRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 120 },
  picker: { flexDirection: "row", alignItems: "center", paddingHorizontal: STEP.s3, height: 56, borderRadius: SHAPE.panel, borderWidth: 1 },
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s2 },
  pill: { flex: 1, minWidth: "22%", height: 48, borderRadius: SHAPE.panel, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  bottomAction: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: GUTTER, paddingBottom: STEP.s4, paddingTop: STEP.s3 },
});
