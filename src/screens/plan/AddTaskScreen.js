import { useState, useCallback, useMemo } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Icon, Button } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC, useSubjectIdentity } from "../../contexts/ThemeContext";
import { useCurriculum } from "../../hooks/useCurriculum";
import { useUserTasks } from "../../hooks/useUserTasks";
import { TopicPicker } from "../wrong-notebook/components/TopicPicker";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

const Q_PRESETS = [10, 20, 30, 50];
const D_PRESETS = [30, 60, 90, 120];

function SubjectCard({ subject, selected, onPress }) {
  const C = useC();
  const sid = useSubjectIdentity(subject.key);
  return (
    <Pressable
      onPress={onPress}
      style={[st.subCard, {
        backgroundColor: selected ? sid.tint : C.surface,
        borderColor: selected ? sid.solid : C.border,
        borderWidth: selected ? 1.5 : 1,
      }]}
    >
      <View style={[st.subIcon, { backgroundColor: selected ? sid.solid : sid.tint }]}>
        <Icon name={subject.icon || "bookOpen"} size={16} color={selected ? C.textOnFill : sid.solid} />
      </View>
      <Text style={[st.subLabel, { color: selected ? sid.solid : C.text }]} numberOfLines={1}>
        {subject.label || subject.name}
      </Text>
      {selected && (
        <View style={[st.subCheck, { backgroundColor: sid.solid }]}>
          <Icon name="check" size={9} color={C.textOnFill} sw={3} />
        </View>
      )}
    </Pressable>
  );
}

function SegmentedPills({ presets, value, onChange, formatLabel, activeColor, C, suffix, placeholder }) {
  const isPreset = presets.includes(parseInt(value, 10));
  return (
    <View style={[st.segContainer, { backgroundColor: C.surface, borderColor: C.border }]}>
      {presets.map((p) => {
        const active = value === String(p);
        return (
          <Pressable key={p} onPress={() => { H.tap(); onChange(String(p)); }} style={[st.segPill, { backgroundColor: active ? activeColor : "transparent" }]}>
            <Text style={[st.segText, { color: active ? C.textOnFill : C.text }]}>{formatLabel(p)}</Text>
          </Pressable>
        );
      })}
      <View style={[st.segDivider, { backgroundColor: C.border }]} />
      <TextInput
        value={isPreset ? "" : value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))}
        placeholder={placeholder || "..."}
        placeholderTextColor={C.muted}
        keyboardType="number-pad"
        style={[st.segInput, { color: C.text }]}
        maxLength={3}
      />
      {!isPreset && value ? <Text style={[st.segSuffix, { color: C.muted }]}>{suffix}</Text> : null}
    </View>
  );
}

export default function AddTaskScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const C = useC();
  const showAlert = useAlert();
  const { tytSubjects, aytSubjects, group1Label, group2Label } = useCurriculum();
  const { createTask } = useUserTasks();
  const preSubject = route.params?.preSubject || null;

  const [tier, setTier] = useState(() => {
    if (preSubject && aytSubjects.some((s) => s.key === preSubject)) return "AYT";
    return "TYT";
  });
  const [subjectKey, setSubjectKey] = useState(preSubject);
  const [topic, setTopic] = useState("");
  const [topicOpen, setTopicOpen] = useState(false);
  const [qCount, setQCount] = useState("");
  const [durVal, setDurVal] = useState("");
  const [note, setNote] = useState("");
  const subjects = tier === "TYT" ? tytSubjects : aytSubjects;
  const current = useMemo(() => subjects.find((s) => s.key === subjectKey), [subjects, subjectKey]);
  const canSave = !!subjectKey;

  const switchTier = (t) => { setTier(t); setSubjectKey(null); setTopic(""); };
  const pickSubject = (key) => { H.select(); setSubjectKey(key); setTopic(""); };

  const save = useCallback(() => {
    if (!canSave) return;
    try {
      createTask({
        subject: subjectKey,
        topic: topic.trim() || undefined,
        questionCount: parseInt(qCount, 10) || undefined,
        targetMinutes: parseInt(durVal, 10) || undefined,
        note: note.trim() || undefined,
      });
      H.success();
      navigation.goBack();
    } catch (e) {
      H.warn();
      showAlert("Hata", e?.issues?.[0]?.message || "Görev eklenemedi");
    }
  }, [canSave, subjectKey, topic, qCount, durVal, note, createTask, navigation]);

  const openTopicPicker = () => {
    if (!current) { H.warn(); showAlert("Önce ders seç", ""); return; }
    H.select(); setTopicOpen(true);
  };

  const fmtDur = (d) => d >= 60 ? `${d / 60}sa` : `${d}dk`;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={st.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={[st.closeBtn, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Icon name="x" size={18} color={C.text} />
          </Pressable>
          <Text style={[st.title, { color: C.text }]}>Görev Ekle</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Tier selector */}
          <Animated.View entering={FadeInDown.duration(420).springify()}>
            <View style={[st.tierRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              {[["TYT", group1Label, C.blue], ["AYT", group2Label, C.purple]].map(([t, lbl, clr]) => {
                const active = tier === t;
                return (
                  <Pressable key={t} onPress={() => switchTier(t)} style={[st.tierBtn, { backgroundColor: active ? clr : "transparent", borderColor: active ? clr : "transparent" }]}>
                    <Text style={[st.tierTitle, { color: active ? C.textOnFill : clr }]}>{lbl}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Subject grid */}
          <Animated.View entering={FadeInDown.delay(70).duration(420).springify()}>
            <Text style={[st.sectionLabel, { color: C.muted }]}>DERS SEÇ</Text>
            <View style={st.grid}>
              {subjects.map((sub) => (
                <SubjectCard key={sub.key} subject={sub} selected={subjectKey === sub.key} onPress={() => pickSubject(sub.key)} />
              ))}
            </View>
          </Animated.View>

          {/* Topic */}
          <Animated.View entering={FadeInDown.delay(140).duration(420).springify()}>
            <Text style={[st.sectionLabel, { color: C.muted }]}>KONU (opsiyonel)</Text>
            <Pressable onPress={openTopicPicker} style={[st.topicBtn, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Icon name={topic ? "checkCircle" : "search"} size={16} color={topic ? C.green : C.muted} />
              <Text style={{ flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: topic ? C.text : C.muted }} numberOfLines={1}>
                {topic || "Konu seç..."}
              </Text>
              <Icon name="chevDown" size={14} color={C.muted} />
            </Pressable>
          </Animated.View>

          {/* Question count */}
          <Animated.View entering={FadeInDown.delay(210).duration(420).springify()}>
            <Text style={[st.sectionLabel, { color: C.muted }]}>SORU SAYISI (opsiyonel)</Text>
            <SegmentedPills presets={Q_PRESETS} value={qCount} onChange={setQCount} formatLabel={String} activeColor={C.accent} C={C} suffix="soru" placeholder="..." />
          </Animated.View>

          {/* Duration */}
          <Animated.View entering={FadeInDown.delay(280).duration(420).springify()}>
            <Text style={[st.sectionLabel, { color: C.muted }]}>HEDEF SÜRE (opsiyonel)</Text>
            <SegmentedPills presets={D_PRESETS} value={durVal} onChange={setDurVal} formatLabel={fmtDur} activeColor={C.blue} C={C} suffix="dk" placeholder="dk" />
          </Animated.View>

          {/* Note */}
          <Animated.View entering={FadeInDown.delay(350).duration(420).springify()}>
            <Text style={[st.sectionLabel, { color: C.muted }]}>NOT (opsiyonel)</Text>
            <TextInput value={note} onChangeText={setNote} placeholder="Kendine bir not bırak..." placeholderTextColor={C.muted} multiline maxLength={140} style={[st.noteInput, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]} />
            <Text style={[st.charCount, { color: C.muted }]}>{note.length}/140</Text>
          </Animated.View>
        </ScrollView>

        <View style={[st.bottom, { borderTopColor: C.border }]}>
          <Button onPress={save} disabled={!canSave} icon="plus" fullWidth>Görevi Ekle</Button>
        </View>
      </KeyboardAvoidingView>

      {topicOpen && current ? (
        <TopicPicker subject={current} visible={topicOpen} onSelect={(t) => { setTopic(t); setTopicOpen(false); }} onClose={() => setTopicOpen(false)} />
      ) : null}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  closeBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  title: { ...TYPOGRAPHY.subheading, textAlign: "center" },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  sectionLabel: { ...TYPOGRAPHY.label, marginTop: 24, marginBottom: 10 },
  tierRow: { flexDirection: "row", borderRadius: RADIUS.xl, borderWidth: 1, padding: 4, gap: 4 },
  tierBtn: { flex: 1, paddingVertical: 12, borderRadius: RADIUS.lg, alignItems: "center" },
  tierTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  subCard: {
    width: "48%", flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: RADIUS.xl,
  },
  subIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  subLabel: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 },
  subCheck: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  topicBtn: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 14, borderRadius: RADIUS.xl, borderWidth: 1 },
  segContainer: { flexDirection: "row", alignItems: "center", borderRadius: RADIUS.xl, borderWidth: 1, padding: 4, gap: 4 },
  segPill: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.lg, alignItems: "center" },
  segText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  segDivider: { width: 1, height: 24, borderRadius: 1 },
  segInput: { width: 44, fontFamily: "Inter_500Medium", fontSize: 14, textAlign: "center", paddingVertical: 8 },
  segSuffix: { fontFamily: "Inter_400Regular", fontSize: 12, marginRight: 6 },
  noteInput: { paddingHorizontal: 14, paddingVertical: 14, borderRadius: RADIUS.xl, borderWidth: 1, fontFamily: "Inter_400Regular", fontSize: 15, minHeight: 80, textAlignVertical: "top" },
  charCount: { ...TYPOGRAPHY.micro, textAlign: "right", marginTop: 4 },
  bottom: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
});
