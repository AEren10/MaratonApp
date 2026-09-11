import { useState, useCallback, useMemo } from "react";
import {
  View, Text, ScrollView, Pressable,
  KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Icon, Button, SectionLabel } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useCurriculum } from "../../hooks/useCurriculum";
import { useUserTasks } from "../../hooks/useUserTasks";
import { TopicPicker } from "../../components/forms/TopicPicker";
import { useAlert } from "../../contexts/AlertContext";
import { userTaskSchema, validate } from "../../validations/auth";
import { AddTaskSubjectList } from "./components/AddTaskSubjectList";
import { AddTaskPillRow } from "./components/AddTaskPillRow";
import { AddTaskWhenSection } from "./components/AddTaskWhenSection";
import { AddTaskTopicField } from "./components/AddTaskTopicField";
import { AddTaskNoteField } from "./components/AddTaskNoteField";
import * as H from "../../lib/haptics";

const Q_PRESETS = [10, 20, 30, 50];
const D_PRESETS = [30, 60, 90, 120];
const fmtDur = (d) => (d >= 60 ? `${d / 60}sa` : `${d}dk`);

export default function AddTaskScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const C = useC();
  const showAlert = useAlert();
  const { tytSubjects, aytSubjects, group1Label, group2Label } = useCurriculum();
  const { createTask } = useUserTasks();
  const preSubject = route.params?.preSubject || null;

  const [subjectKey, setSubjectKey] = useState(preSubject);
  const [topic, setTopic] = useState("");
  const [topicOpen, setTopicOpen] = useState(false);
  const [qCount, setQCount] = useState("");
  const [durVal, setDurVal] = useState("");
  const [note, setNote] = useState("");

  const allSubjects = useMemo(() => [...tytSubjects, ...aytSubjects], [tytSubjects, aytSubjects]);
  const current = useMemo(() => allSubjects.find((s) => s.key === subjectKey), [allSubjects, subjectKey]);
  const groups = useMemo(() => {
    const list = [];
    if (tytSubjects.length) list.push({ label: group1Label, items: tytSubjects });
    if (aytSubjects.length) list.push({ label: group2Label, items: aytSubjects });
    return list;
  }, [tytSubjects, aytSubjects, group1Label, group2Label]);

  const canSave = !!subjectKey;
  const pickSubject = (key) => { H.select(); setSubjectKey(key); setTopic(""); };

  const save = useCallback(async () => {
    if (!canSave) return;
    const input = {
      subject: subjectKey,
      topic: topic.trim() || undefined,
      questionCount: parseInt(qCount, 10) || undefined,
      targetMinutes: parseInt(durVal, 10) || undefined,
      note: note.trim() || undefined,
    };
    const { ok, errors } = validate(userTaskSchema, input);
    if (!ok) {
      H.warn();
      showAlert("Hata", Object.values(errors)[0] || "Görev eklenemedi");
      return;
    }
    try {
      await createTask(input);
      H.success();
      navigation.goBack();
    } catch (e) {
      H.warn();
      showAlert("Hata", e?.issues?.[0]?.message || "Görev eklenemedi");
    }
  }, [canSave, subjectKey, topic, qCount, durVal, note, createTask, navigation, showAlert]);

  const openTopicPicker = () => {
    if (!current) { H.warn(); showAlert("Önce ders seç", ""); return; }
    H.select(); setTopicOpen(true);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={st.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={st.backBtn}>
            <Icon name="chevL" size={16} color={C.text2} />
          </Pressable>
          <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Durak ekle</Text>
        </View>

        <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(420).springify()}>
            <AddTaskSubjectList groups={groups} subjectKey={subjectKey} onPick={pickSubject} C={C} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(70).duration(420).springify()} style={st.section}>
            <AddTaskTopicField topic={topic} onPress={openTopicPicker} C={C} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).duration(420).springify()} style={st.section}>
            <SectionLabel>Süre</SectionLabel>
            <AddTaskPillRow presets={D_PRESETS} value={durVal} onChange={setDurVal} formatLabel={fmtDur} C={C} suffix="dk" placeholder="dk" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(210).duration(420).springify()} style={st.section}>
            <AddTaskWhenSection C={C} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(280).duration(420).springify()} style={st.section}>
            <SectionLabel>Soru sayısı (opsiyonel)</SectionLabel>
            <AddTaskPillRow presets={Q_PRESETS} value={qCount} onChange={setQCount} formatLabel={String} C={C} suffix="soru" placeholder="..." />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(350).duration(420).springify()} style={st.section}>
            <AddTaskNoteField value={note} onChange={setNote} C={C} />
          </Animated.View>
        </ScrollView>

        <View style={st.bottom}>
          <Button onPress={save} disabled={!canSave} fullWidth>Rotaya ekle</Button>
        </View>
      </KeyboardAvoidingView>

      {topicOpen && current ? (
        <TopicPicker subject={current} visible={topicOpen} onSelect={(t) => { setTopic(t); setTopicOpen(false); }} onClose={() => setTopicOpen(false)} />
      ) : null}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingHorizontal: GUTTER, paddingTop: 4 },
  backBtn: { width: CONTROL.buttonTertiary, height: CONTROL.buttonTertiary, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 100 },
  section: { marginTop: STEP.s4 },
  bottom: { paddingHorizontal: GUTTER, paddingVertical: STEP.s2 },
});
