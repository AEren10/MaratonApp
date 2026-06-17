import { useState, useCallback, useMemo } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC, useSubjectIdentity } from "../../contexts/ThemeContext";
import { useCurriculum } from "../../hooks/useCurriculum";
import { useUserTasks } from "../../hooks/useUserTasks";
import { TopicPicker } from "../wrong-notebook/components/TopicPicker";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

const Q_PRESETS = [10, 20, 30, 50];

function SubjectChip({ subject, selected, onPress, C }) {
  const sid = useSubjectIdentity(subject.key);
  const bg = selected ? sid.solid : sid.tint;
  const textColor = selected ? "#FFFFFF" : sid.solid;
  return (
    <Pressable onPress={onPress} style={[s.chip, { backgroundColor: bg }]}>
      <Text style={[s.chipText, { color: textColor }]}>{subject.label || subject.name}</Text>
    </Pressable>
  );
}

export default function AddTaskScreen() {
  const navigation = useNavigation();
  const C = useC();
  const showAlert = useAlert();
  const { tytSubjects, aytSubjects, group1Label, group2Label } = useCurriculum();
  const { createTask } = useUserTasks();

  const [tier, setTier] = useState("TYT");
  const [subjectKey, setSubjectKey] = useState(null);
  const [topic, setTopic] = useState("");
  const [topicOpen, setTopicOpen] = useState(false);
  const [qCount, setQCount] = useState("20");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const subjects = tier === "TYT" ? tytSubjects : aytSubjects;
  const current = useMemo(() => subjects.find((s) => s.key === subjectKey), [subjects, subjectKey]);
  const canSave = !!subjectKey && parseInt(qCount, 10) > 0;

  const switchTier = (t) => { setTier(t); setSubjectKey(null); setTopic(""); };
  const pickSubject = (key) => { H.select(); setSubjectKey(key); setTopic(""); };

  const save = useCallback(async () => {
    if (saving || !canSave) return;
    setSaving(true);
    try {
      await createTask({
        subject: subjectKey,
        topic: topic.trim() || undefined,
        questionCount: parseInt(qCount, 10),
        note: note.trim() || undefined,
      });
      H.success();
      navigation.goBack();
    } catch (e) {
      H.warn();
      showAlert("Hata", e?.issues?.[0]?.message || "Görev eklenemedi");
    } finally {
      setSaving(false);
    }
  }, [saving, canSave, subjectKey, topic, qCount, note, createTask, navigation]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={[s.closeBtn, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Icon name="x" size={18} color={C.text} />
          </Pressable>
          <Text style={[s.title, { color: C.text }]}>Görev Ekle</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(420).springify()}>
            <Text style={[s.label, { color: C.muted }]}>SINAV TİPİ</Text>
            <View style={s.tierRow}>
              {[["TYT", group1Label, C.blue], ["AYT", group2Label, C.purple]].map(([t, lbl, clr]) => (
                <Pressable key={t} onPress={() => switchTier(t)} style={[s.tierBtn, { backgroundColor: tier === t ? clr : clr + "10", borderColor: tier === t ? clr : clr + "26" }]}>
                  <Text style={[s.tierTitle, { color: tier === t ? "#FFF" : clr }]}>{lbl}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(70).duration(420).springify()}>
            <Text style={[s.label, { color: C.muted, marginTop: 22 }]}>DERS</Text>
            <View style={s.grid}>{subjects.map((sub) => (
              <SubjectChip key={sub.key} subject={sub} selected={subjectKey === sub.key} onPress={() => pickSubject(sub.key)} C={C} />
            ))}</View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).duration(420).springify()}>
            <Text style={[s.label, { color: C.muted, marginTop: 22 }]}>KONU (opsiyonel)</Text>
            <Pressable onPress={() => { if (!current) { H.warn(); showAlert("Önce ders seç", ""); return; } H.select(); setTopicOpen(true); }} style={[s.input, { backgroundColor: C.surface, borderColor: C.border, flexDirection: "row", alignItems: "center" }]}>
              <Text style={{ flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: topic ? C.text : C.muted }} numberOfLines={1}>{topic || "Konu seç"}</Text>
              <Icon name="chevDown" size={16} color={C.muted} />
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(210).duration(420).springify()}>
            <Text style={[s.label, { color: C.muted, marginTop: 22 }]}>SORU SAYISI</Text>
            <View style={s.qRow}>
              {Q_PRESETS.map((q) => {
                const active = qCount === String(q);
                return (
                  <Pressable key={q} onPress={() => { H.tap(); setQCount(String(q)); }} style={[s.qChip, { backgroundColor: active ? C.accent : C.surface, borderColor: active ? C.accent : C.border }]}>
                    <Text style={[s.qText, { color: active ? "#FFF" : C.text }]}>{q}</Text>
                  </Pressable>
                );
              })}
              <TextInput value={Q_PRESETS.includes(parseInt(qCount)) ? "" : qCount} onChangeText={setQCount} placeholder="..." placeholderTextColor={C.muted} keyboardType="number-pad" style={[s.qInput, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]} maxLength={3} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(280).duration(420).springify()}>
            <Text style={[s.label, { color: C.muted, marginTop: 22 }]}>NOT (opsiyonel)</Text>
            <TextInput value={note} onChangeText={setNote} placeholder="Kendine bir not bırak..." placeholderTextColor={C.muted} multiline maxLength={140} style={[s.noteInput, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]} />
            <Text style={[s.charCount, { color: C.muted }]}>{note.length}/140</Text>
          </Animated.View>
        </ScrollView>

        <View style={[s.bottom, { borderTopColor: C.border }]}>
          <Pressable onPress={save} disabled={!canSave || saving} style={({ pressed }) => [s.saveBtn, { backgroundColor: canSave ? C.accent : C.surface, opacity: pressed ? 0.92 : saving ? 0.6 : 1 }]}>
            <Icon name="plus" size={18} color={canSave ? "#FFF" : C.muted} sw={2.5} />
            <Text style={[s.saveBtnText, { color: canSave ? "#FFF" : C.muted }]}>Görevi Ekle</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {topicOpen && current ? (
        <TopicPicker subject={current} visible={topicOpen} onSelect={(t) => { setTopic(t); setTopicOpen(false); }} onClose={() => setTopicOpen(false)} />
      ) : null}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  closeBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  title: { ...TYPOGRAPHY.subheading, textAlign: "center" },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  label: { ...TYPOGRAPHY.label, marginBottom: 10 },
  tierRow: { flexDirection: "row", gap: 10 },
  tierBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS.xl, borderWidth: 1, alignItems: "center" },
  tierTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.lg },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  input: { paddingHorizontal: 14, paddingVertical: 14, borderRadius: RADIUS.lg, borderWidth: 1 },
  qRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  qChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.lg, borderWidth: 1 },
  qText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  qInput: { width: 60, paddingHorizontal: 12, paddingVertical: 10, borderRadius: RADIUS.lg, borderWidth: 1, fontFamily: "Inter_500Medium", fontSize: 14, textAlign: "center" },
  noteInput: { paddingHorizontal: 14, paddingVertical: 14, borderRadius: RADIUS.lg, borderWidth: 1, fontFamily: "Inter_400Regular", fontSize: 15, minHeight: 80, textAlignVertical: "top" },
  charCount: { ...TYPOGRAPHY.micro, textAlign: "right", marginTop: 4 },
  bottom: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: RADIUS.xl },
  saveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
});
