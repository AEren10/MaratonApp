import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING } from "../../themes/tokens";
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
import { saveStudyLogOffline } from "../../lib/offlineQueue";
import { TopicPicker } from "../wrong-notebook/components/TopicPicker";

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function AddStudyScreen() {
  const navigation = useNavigation();
  const C = useC();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { tytSubjects, aytSubjects } = useCurriculum();
  const { reward, xpToast, dismissXP, badgeModal, dismissBadge } = useGamification();

  const [examTier, setExamTier] = useState("TYT"); // TYT | AYT
  const [subjectKey, setSubjectKey] = useState(null);
  const [topic, setTopic]       = useState("");
  const [topicPickerOpen, setTopicPickerOpen] = useState(false);
  const [questionCount, setQC]  = useState("");
  const [duration, setDuration] = useState(null);
  const [notes, setNotes]       = useState("");
  const [saving, setSaving]     = useState(false);

  const subjects = useMemo(() => {
    return examTier === "TYT" ? tytSubjects : aytSubjects;
  }, [examTier, tytSubjects, aytSubjects]);

  const currentSubject = useMemo(
    () => subjects.find((s) => s.key === subjectKey) || null,
    [subjects, subjectKey]
  );

  const canSave = !!subjectKey && topic.trim() && duration;

  const handleSwitchTier = (tier) => {
    setExamTier(tier);
    setSubjectKey(null);
    setTopic("");
  };

  const handleSelectSubject = (key) => {
    setSubjectKey(key);
    setTopic("");
  };

  const save = useCallback(async () => {
    if (saving || !canSave) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const qc = parseInt(questionCount, 10) || 0;
    const localLog = {
      id: Date.now().toString(),
      subject: subjectKey,
      topic: topic.trim(),
      questionCount: qc,
      duration,
      notes,
      examTier,
      study_date: todayStr,
    };
    dispatch(addLog(localLog));

    setSaving(true);
    const result = await saveStudyLogOffline({
      user_id: user.id,
      subject: subjectKey,
      topic: topic.trim(),
      question_count: qc,
      correct_count: 0,
      duration_minutes: duration,
      study_date: todayStr,
    });

    if (result.saved) {
      try {
        const streakData = await getStreak(user.id);
        const { updates, newStreak, usedFreeze, freezeCount } = computeStreakUpdate(streakData);
        await updateStreak(user.id, updates);
        dispatch(setStreak(newStreak));
        dispatch(setFreezeCount(freezeCount));
        if (usedFreeze) {
          Alert.alert("🛡 Joker kullanıldı", "Bir gün atlamıştın ama jokerin streak'ini korudu!");
        }
      } catch (_) {}
    } else if (result.queued) {
      Alert.alert("Çevrimdışı", "Internet yok, kayıt bağlantı geldiğinde otomatik gönderilecek.");
    }
    setSaving(false);

    const statUpdates = [
      { type: "increment", key: "totalQuestions", value: qc },
      { type: "increment", key: "totalMinutes",   value: duration },
    ];
    reward("study_log", { minutes: duration, statUpdates });
    if (qc > 0) reward("question_solved", { count: qc });

    navigation.goBack();
  }, [saving, canSave, subjectKey, topic, duration, questionCount, notes, examTier, user, dispatch, reward, navigation]);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* === Header === */}
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={[s.closeBtn, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Icon name="x" size={18} color={C.text} />
          </Pressable>
          <Text style={[s.title, { color: C.text }]}>Çalışma Kaydet</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* === Sınav tipi: TYT / AYT === */}
          <Text style={[s.label, { color: C.muted }]}>SINAV TİPİ</Text>
          <View style={s.tierRow}>
            <Pressable
              onPress={() => handleSwitchTier("TYT")}
              style={[
                s.tierBtn,
                {
                  backgroundColor: examTier === "TYT" ? C.blue : C.blue + "10",
                  borderColor: examTier === "TYT" ? C.blue : C.blue + "26",
                  shadowColor: examTier === "TYT" ? C.blue : "transparent",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: examTier === "TYT" ? 4 : 0,
                },
              ]}
            >
              <Text style={[s.tierTitle, { color: examTier === "TYT" ? "#FFFFFF" : C.blue }]}>
                TYT
              </Text>
              <Text style={[s.tierDesc, { color: examTier === "TYT" ? "rgba(255,255,255,0.85)" : C.muted }]}>
                Temel Yeterlilik
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleSwitchTier("AYT")}
              style={[
                s.tierBtn,
                {
                  backgroundColor: examTier === "AYT" ? C.purple : C.purple + "10",
                  borderColor: examTier === "AYT" ? C.purple : C.purple + "26",
                  shadowColor: examTier === "AYT" ? C.purple : "transparent",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: examTier === "AYT" ? 4 : 0,
                },
              ]}
            >
              <Text style={[s.tierTitle, { color: examTier === "AYT" ? "#FFFFFF" : C.purple }]}>
                AYT
              </Text>
              <Text style={[s.tierDesc, { color: examTier === "AYT" ? "rgba(255,255,255,0.85)" : C.muted }]}>
                Alan Yeterlilik
              </Text>
            </Pressable>
          </View>

          {/* === Ders grid === */}
          <Text style={[s.label, { color: C.muted, marginTop: 22 }]}>DERS</Text>
          <View style={s.subjectGrid}>
            {subjects.map((sub) => (
              <SubjectChip
                key={sub.key}
                subject={sub}
                selected={subjectKey === sub.key}
                onPress={() => handleSelectSubject(sub.key)}
                C={C}
              />
            ))}
          </View>

          {/* === Konu (curriculum konu listesi) === */}
          <Text style={[s.label, { color: C.muted, marginTop: 22 }]}>KONU</Text>
          <Pressable
            onPress={() => {
              if (!currentSubject) {
                Alert.alert("Önce ders seç", "Konu listesi için ders seçmelisin.");
                return;
              }
              setTopicPickerOpen(true);
            }}
            style={[
              s.input,
              {
                backgroundColor: C.surface,
                borderColor: C.border,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              },
            ]}
          >
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: topic ? C.text : C.muted,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {topic || (currentSubject ? "Konu seç" : "Önce ders seç")}
            </Text>
            <Icon name="chevDown" size={16} color={C.muted} />
          </Pressable>

          {/* === Süre pill row === */}
          <Text style={[s.label, { color: C.muted, marginTop: 22 }]}>SÜRE</Text>
          <View style={s.durationRow}>
            {DURATIONS.map((d) => {
              const active = duration === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDuration(d)}
                  style={[
                    s.durChip,
                    {
                      backgroundColor: active ? C.amber : C.surface,
                      borderColor: active ? C.amber : C.border,
                    },
                  ]}
                >
                  <Text style={[s.durText, { color: active ? "#FFFFFF" : C.text }]}>
                    {d} dk
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* === Soru sayısı === */}
          <Text style={[s.label, { color: C.muted, marginTop: 22 }]}>ÇÖZÜLEN SORU (opsiyonel)</Text>
          <TextInput
            value={questionCount}
            onChangeText={(t) => setQC(t.replace(/[^0-9]/g, ""))}
            placeholder="0"
            placeholderTextColor={C.muted}
            keyboardType="number-pad"
            maxLength={4}
            style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]}
          />

          {/* === Not === */}
          <Text style={[s.label, { color: C.muted, marginTop: 22 }]}>NOT (opsiyonel)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Kısa bir not bırak"
            placeholderTextColor={C.muted}
            multiline
            maxLength={140}
            style={[
              s.input, s.multiline,
              { backgroundColor: C.surface, color: C.text, borderColor: C.border },
            ]}
          />
        </ScrollView>

        {/* === Submit bar === */}
        <View style={[s.bottomBar, { backgroundColor: C.bg, borderTopColor: C.border }]}>
          <Pressable
            onPress={save}
            disabled={!canSave || saving}
            style={({ pressed }) => [
              s.submitBtn,
              {
                backgroundColor: canSave ? C.purple : C.surface2,
                shadowColor: canSave ? C.purple : "transparent",
              },
              (pressed && canSave) && { opacity: 0.92, transform: [{ scale: 0.99 }] },
            ]}
          >
            <Icon name="check" size={20} color={canSave ? "#FFFFFF" : C.muted} sw={2.5} />
            <Text style={[s.submitText, { color: canSave ? "#FFFFFF" : C.muted }]}>
              {saving ? "Kaydediliyor..." : "Çalışmayı Kaydet"}
            </Text>
          </Pressable>
        </View>

        <TopicPicker
          visible={topicPickerOpen}
          subject={currentSubject}
          onClose={() => setTopicPickerOpen(false)}
          onSelect={(name) => setTopic(name)}
        />

        <XPToast amount={xpToast.amount} visible={xpToast.visible} onDone={dismissXP} />
        <BadgeUnlockModal badge={badgeModal.badge} visible={badgeModal.visible} onClose={dismissBadge} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SubjectChip({ subject, selected, onPress, C }) {
  const id = useSubjectIdentity(subject.key);
  const color = id?.solid || subject.color || C.purple;
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.subjChip,
        {
          backgroundColor: selected ? color : color + "10",
          borderColor: selected ? color : color + "24",
        },
      ]}
    >
      <View style={[
        s.subjIconBox,
        { backgroundColor: selected ? "rgba(255,255,255,0.22)" : color + "1A" },
      ]}>
        <Icon name={subject.icon} size={16} color={selected ? "#FFFFFF" : color} />
      </View>
      <Text style={[s.subjName, { color: selected ? "#FFFFFF" : C.text }]} numberOfLines={1}>
        {subject.label || subject.name}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  title: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 18 },
  scroll: { padding: SPACING.lg, paddingBottom: 140 },
  label: { ...TYPOGRAPHY.label, marginBottom: 10, letterSpacing: 0.7 },

  tierRow: { flexDirection: "row", gap: 12 },
  tierBtn: {
    flex: 1, padding: 16, borderRadius: 18, borderWidth: 1.5,
    alignItems: "flex-start",
  },
  tierTitle: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 24, letterSpacing: -0.5 },
  tierDesc: { ...TYPOGRAPHY.caption, marginTop: 2 },

  subjectGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  subjChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1,
    minWidth: "47%", flexGrow: 1,
  },
  subjIconBox: {
    width: 28, height: 28, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  subjName: { ...TYPOGRAPHY.bodySemiBold, fontSize: 14, flexShrink: 1 },

  input: {
    ...TYPOGRAPHY.body, borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 14, fontSize: 15,
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },

  durationRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  durChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  durText: { ...TYPOGRAPHY.bodySemiBold, fontSize: 14 },

  bottomBar: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    padding: SPACING.lg, borderTopWidth: 1,
  },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 999, paddingVertical: 17,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius: 18,
    elevation: 6,
  },
  submitText: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
});
