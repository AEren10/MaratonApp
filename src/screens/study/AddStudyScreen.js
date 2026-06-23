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
import { useAppDispatch } from "../../store/hooks";
import { addLog, setStreak, setFreezeCount } from "../../store/slices/studyLogSlice";
import { computeStreakUpdate } from "../../lib/streakFreeze";
import { useGamification } from "../../hooks/useGamification";
import { useCurriculum } from "../../hooks/useCurriculum";
import { XPToast } from "../../components/common/XPToast";
import { BadgeUnlockModal } from "../../components/common/BadgeUnlockModal";
import { useAuth } from "../../contexts/AuthContext";
import { getStreak, updateStreak } from "../../supabase/streaks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveStudyLogOffline } from "../../lib/offlineQueue";
import { syncChallengeProgress } from "../../lib/challengeSync";
import { TopicPicker } from "../wrong-notebook/components/TopicPicker";
import { studyLogSchema } from "../../validations/auth";
import { SCREENS } from "../../constants/screens";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

const D_PRESETS = [15, 30, 45, 60, 90, 120];

function SubjectCard({ subject, selected, onPress }) {
  const C = useC();
  const sid = useSubjectIdentity(subject.key);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={subject.label || subject.name}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[st.subCard, {
        backgroundColor: selected ? sid.tint : C.surface,
        borderColor: selected ? sid.solid : C.border,
        borderWidth: selected ? 1.5 : 1,
      }]}
    >
      <View style={[st.subIcon, { backgroundColor: selected ? sid.solid : sid.tint }]}>
        <Icon name={subject.icon || "bookOpen"} size={16} color={selected ? "#FFF" : sid.solid} />
      </View>
      <Text style={[st.subLabel, { color: selected ? sid.solid : C.text }]} numberOfLines={1}>
        {subject.label || subject.name}
      </Text>
      {selected && (
        <View style={[st.subCheck, { backgroundColor: sid.solid }]}>
          <Icon name="check" size={9} color="#FFF" sw={3} />
        </View>
      )}
    </Pressable>
  );
}

export default function AddStudyScreen() {
  const navigation = useNavigation();
  const C = useC();
  const showAlert = useAlert();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { tytSubjects, aytSubjects, group1Label, group2Label } = useCurriculum();
  const { reward, xpToast, dismissXP, badgeModal, dismissBadge } = useGamification();

  const [tier, setTier] = useState("TYT");
  const [subjectKey, setSubjectKey] = useState(null);
  const [topic, setTopic] = useState("");
  const [topicOpen, setTopicOpen] = useState(false);
  const [duration, setDuration] = useState(null);
  const [customDur, setCustomDur] = useState("");
  const [qCount, setQCount] = useState("");
  const [correctCount, setCC] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const subjects = tier === "TYT" ? tytSubjects : aytSubjects;
  const current = useMemo(() => subjects.find((s) => s.key === subjectKey), [subjects, subjectKey]);
  const canSave = !!subjectKey && topic.trim() && duration;

  const switchTier = (t) => { H.select(); setTier(t); setSubjectKey(null); setTopic(""); };
  const pickSubject = (key) => { H.select(); setSubjectKey(key); setTopic(""); };

  const openTopicPicker = () => {
    if (!current) { H.warn(); showAlert("Önce ders seç", ""); return; }
    H.select(); setTopicOpen(true);
  };

  const pickDuration = (d) => { H.tap(); setDuration(d); setCustomDur(""); };
  const handleCustomDur = (t) => {
    const num = t.replace(/[^0-9]/g, "");
    setCustomDur(num);
    const v = parseInt(num, 10);
    setDuration(v > 0 && v <= 720 ? v : null);
  };

  const save = useCallback(async () => {
    if (saving || !canSave) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const qc = parseInt(qCount, 10) || 0;
    const cc = parseInt(correctCount, 10) || 0;

    const parsed = studyLogSchema.safeParse({
      subject: subjectKey, topic: topic.trim(),
      questionCount: qc, correctCount: cc,
      duration, notes: notes.trim() || undefined,
    });
    if (!parsed.success) {
      H.warn();
      showAlert("Hata", parsed.error.issues[0]?.message || "Geçersiz değer");
      return;
    }

    dispatch(addLog({
      id: Date.now().toString(), subject: subjectKey, topic: topic.trim(),
      questionCount: qc, correctCount: cc, duration, notes, examTier: tier, study_date: todayStr,
    }));

    setSaving(true);
    const result = await saveStudyLogOffline({
      user_id: user.id, subject: subjectKey, topic: topic.trim(),
      question_count: qc, correct_count: cc, duration_minutes: duration,
      study_date: todayStr, notes: notes.trim() || null,
    });

    if (result.saved) {
      try {
        const streakData = await getStreak(user.id);
        const { updates, newStreak, usedFreeze, freezeCount } = computeStreakUpdate(streakData);
        dispatch(setStreak(newStreak));
        dispatch(setFreezeCount(freezeCount));
        try {
          await updateStreak(user.id, updates);
        } catch (_) {
          AsyncStorage.setItem("@maraton:pending_streak", JSON.stringify({ userId: user.id, updates })).catch(() => {});
        }
        if (usedFreeze) showAlert("🛡 Joker kullanıldı", "Bir gün atlamıştın ama jokerin streak'ini korudu!");
      } catch (e) { __DEV__ && console.warn("streak update failed:", e); }
      syncChallengeProgress(user.id, { questions: qc, minutes: duration });
    } else if (result.queued) {
      const msg = result.error?.message || "";
      const isNet = msg.includes("network") || msg.includes("fetch");
      showAlert(isNet ? "Çevrimdışı" : "Kayıt beklemede", isNet ? "Kayıt bağlantı geldiğinde gönderilecek." : "Kayıt sıraya alındı.");
    }
    setSaving(false);

    reward("study_log", { minutes: duration, statUpdates: [
      { type: "increment", key: "totalQuestions", value: qc },
      { type: "increment", key: "totalMinutes", value: duration },
    ]});
    if (qc > 0) reward("question_solved", { count: qc });

    H.success();
    navigation.replace(SCREENS.STUDY_SUMMARY, {
      subjectLabel: current?.label || subjectKey,
      subjectColor: current?.color || C.purple,
      subjectIcon: current?.icon || "bookOpen",
      topic: topic.trim(), duration, questions: qc,
    });
  }, [saving, canSave, subjectKey, topic, duration, qCount, correctCount, notes, tier, user, dispatch, reward, navigation]);

  const fmtDur = (d) => d >= 60 ? `${d / 60}sa` : `${d}dk`;
  const isDurPreset = D_PRESETS.includes(duration) && !customDur;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={st.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Kapat" accessibilityRole="button" style={[st.closeBtn, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Icon name="x" size={18} color={C.text} />
          </Pressable>
          <Text style={[st.title, { color: C.text }]}>Geçmiş Kaydet</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Tier */}
          <Animated.View entering={FadeInDown.duration(420).springify()}>
            <View style={[st.tierRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              {[["TYT", group1Label, C.blue], ["AYT", group2Label, C.purple]].map(([t, lbl, clr]) => {
                const active = tier === t;
                return (
                  <Pressable key={t} accessibilityRole="radio" accessibilityLabel={lbl} accessibilityState={{ selected: active }} onPress={() => switchTier(t)} style={[st.tierBtn, { backgroundColor: active ? clr : "transparent", borderColor: active ? clr : "transparent" }]}>
                    <Text style={[st.tierTitle, { color: active ? "#FFF" : clr }]}>{lbl}</Text>
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
            <Text style={[st.sectionLabel, { color: C.muted }]}>KONU</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={topic || "Konu seç"} accessibilityHint="Konu seçici açılır" onPress={openTopicPicker} style={[st.topicBtn, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Icon name={topic ? "checkCircle" : "search"} size={16} color={topic ? C.green : C.muted} />
              <Text style={{ flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: topic ? C.text : C.muted }} numberOfLines={1}>
                {topic || (current ? "Konu seç..." : "Önce ders seç")}
              </Text>
              <Icon name="chevDown" size={14} color={C.muted} />
            </Pressable>
          </Animated.View>

          {/* Duration */}
          <Animated.View entering={FadeInDown.delay(210).duration(420).springify()}>
            <Text style={[st.sectionLabel, { color: C.muted }]}>SÜRE</Text>
            <View style={[st.segContainer, { backgroundColor: C.surface, borderColor: C.border }]}>
              {D_PRESETS.map((d) => {
                const active = duration === d && isDurPreset;
                return (
                  <Pressable key={d} accessibilityRole="radio" accessibilityLabel={`${fmtDur(d)} süre`} accessibilityState={{ selected: active }} onPress={() => pickDuration(d)} style={[st.segPill, { backgroundColor: active ? C.blue : "transparent" }]}>
                    <Text style={[st.segText, { color: active ? "#FFF" : C.text }]}>{fmtDur(d)}</Text>
                  </Pressable>
                );
              })}
              <View style={[st.segDivider, { backgroundColor: C.border }]} />
              <TextInput value={customDur} onChangeText={handleCustomDur} placeholder="dk" placeholderTextColor={C.muted} keyboardType="number-pad" maxLength={3} style={[st.segInput, { color: C.text }]} />
            </View>
          </Animated.View>

          {/* Questions + Correct */}
          <Animated.View entering={FadeInDown.delay(280).duration(420).springify()}>
            <Text style={[st.sectionLabel, { color: C.muted }]}>ÇÖZÜLEN SORU (opsiyonel)</Text>
            <View style={[st.inlineRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              <View style={st.inlineField}>
                <Text style={[st.inlineLabel, { color: C.muted }]}>Soru</Text>
                <TextInput value={qCount} onChangeText={(t) => { setQCount(t.replace(/[^0-9]/g, "")); if (!t) setCC(""); }} placeholder="0" placeholderTextColor={C.muted} keyboardType="number-pad" maxLength={4} style={[st.inlineInput, { color: C.text }]} />
              </View>
              {parseInt(qCount, 10) > 0 && (
                <>
                  <View style={[st.inlineDivider, { backgroundColor: C.border }]} />
                  <View style={st.inlineField}>
                    <Text style={[st.inlineLabel, { color: C.muted }]}>Doğru</Text>
                    <TextInput value={correctCount} onChangeText={(t) => setCC(t.replace(/[^0-9]/g, ""))} placeholder="0" placeholderTextColor={C.muted} keyboardType="number-pad" maxLength={4} style={[st.inlineInput, { color: C.text }]} />
                  </View>
                </>
              )}
            </View>
          </Animated.View>

          {/* Note */}
          <Animated.View entering={FadeInDown.delay(350).duration(420).springify()}>
            <Text style={[st.sectionLabel, { color: C.muted }]}>NOT (opsiyonel)</Text>
            <TextInput value={notes} onChangeText={setNotes} placeholder="Kendine bir not bırak..." placeholderTextColor={C.muted} multiline maxLength={140} style={[st.noteInput, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]} />
            <Text style={[st.charCount, { color: C.muted }]}>{notes.length}/140</Text>
          </Animated.View>
        </ScrollView>

        <View style={[st.bottom, { borderTopColor: C.border }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Kaydet" accessibilityHint="Çalışma kaydını kaydeder" onPress={save} disabled={!canSave || saving} style={({ pressed }) => [st.saveBtn, { backgroundColor: canSave ? C.accent : C.surface, opacity: pressed ? 0.92 : 1 }]}>
            <Icon name="check" size={18} color={canSave ? "#FFF" : C.muted} sw={2.5} />
            <Text style={[st.saveBtnText, { color: canSave ? "#FFF" : C.muted }]}>{saving ? "Kaydediliyor..." : "Çalışmayı Kaydet"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {topicOpen && current ? (
        <TopicPicker subject={current} visible={topicOpen} onSelect={(t) => { setTopic(t); setTopicOpen(false); }} onClose={() => setTopicOpen(false)} />
      ) : null}

      <XPToast amount={xpToast.amount} visible={xpToast.visible} onDone={dismissXP} />
      <BadgeUnlockModal badge={badgeModal.badge} visible={badgeModal.visible} onClose={dismissBadge} />
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
  segText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  segDivider: { width: 1, height: 24, borderRadius: 1 },
  segInput: { width: 44, fontFamily: "Inter_500Medium", fontSize: 14, textAlign: "center", paddingVertical: 8 },
  inlineRow: { flexDirection: "row", borderRadius: RADIUS.xl, borderWidth: 1, padding: 4 },
  inlineField: { flex: 1, alignItems: "center", paddingVertical: 8 },
  inlineLabel: { fontFamily: "Inter_400Regular", fontSize: 11 },
  inlineInput: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 22, textAlign: "center", padding: 0, minWidth: 60 },
  inlineDivider: { width: 1, alignSelf: "stretch", marginVertical: 6, borderRadius: 1 },
  noteInput: { paddingHorizontal: 14, paddingVertical: 14, borderRadius: RADIUS.xl, borderWidth: 1, fontFamily: "Inter_400Regular", fontSize: 15, minHeight: 80, textAlignVertical: "top" },
  charCount: { ...TYPOGRAPHY.micro, textAlign: "right", marginTop: 4 },
  bottom: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: RADIUS.xl },
  saveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
});
