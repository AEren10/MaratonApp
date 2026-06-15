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
import { useExam } from "../../contexts/ExamContext";
import { XPToast } from "../../components/common/XPToast";
import { BadgeUnlockModal } from "../../components/common/BadgeUnlockModal";
import { useAuth } from "../../contexts/AuthContext";
import { getStreak, updateStreak } from "../../supabase/streaks";
import { saveStudyLogOffline } from "../../lib/offlineQueue";

// === Sınav tipine göre ders setleri ===
const TYT_SUBJECTS = [
  { key: "turkce",    name: "Türkçe",     icon: "bookOpen" },
  { key: "matematik", name: "Matematik",  icon: "hash" },
  { key: "fizik",     name: "Fizik",      icon: "zap" },
  { key: "kimya",     name: "Kimya",      icon: "flask" },
  { key: "biyoloji",  name: "Biyoloji",   icon: "activity" },
  { key: "tarih",     name: "Tarih",      icon: "clock" },
  { key: "cografya",  name: "Coğrafya",   icon: "globe" },
  { key: "felsefe",   name: "Felsefe",    icon: "bookOpen" },
  { key: "din",       name: "Din",        icon: "bookOpen" },
];

const AYT_SUBJECTS_BY_FIELD = {
  sayisal: [
    { key: "ayt_matematik", name: "AYT Matematik", icon: "hash" },
    { key: "ayt_fizik",     name: "AYT Fizik",     icon: "zap" },
    { key: "ayt_kimya",     name: "AYT Kimya",     icon: "flask" },
    { key: "ayt_biyoloji",  name: "AYT Biyoloji",  icon: "activity" },
  ],
  ea: [
    { key: "ayt_ea_matematik", name: "AYT Matematik", icon: "hash" },
    { key: "ayt_edebiyat",     name: "AYT Edebiyat",  icon: "bookOpen" },
    { key: "ayt_tarih_ea",     name: "AYT Tarih-1",   icon: "clock" },
    { key: "ayt_cografya_ea",  name: "AYT Coğrafya-1", icon: "globe" },
  ],
  sozel: [
    { key: "ayt_edebiyat_soz", name: "AYT Edebiyat",  icon: "bookOpen" },
    { key: "ayt_tarih_soz",    name: "AYT Tarih",     icon: "clock" },
    { key: "ayt_cografya_soz", name: "AYT Coğrafya",  icon: "globe" },
    { key: "ayt_felsefe_soz",  name: "AYT Felsefe",   icon: "bookOpen" },
  ],
};

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function AddStudyScreen() {
  const navigation = useNavigation();
  const C = useC();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { field } = useExam();
  const { reward, xpToast, dismissXP, badgeModal, dismissBadge } = useGamification();

  const [examTier, setExamTier] = useState("TYT"); // TYT | AYT
  const [subject, setSubject]   = useState(null);
  const [topic, setTopic]       = useState("");
  const [questionCount, setQC]  = useState("");
  const [duration, setDuration] = useState(null);
  const [notes, setNotes]       = useState("");
  const [saving, setSaving]     = useState(false);

  // Sınav tipine göre ders havuzu
  const subjects = useMemo(() => {
    if (examTier === "TYT") return TYT_SUBJECTS;
    return AYT_SUBJECTS_BY_FIELD[field || "sayisal"] || AYT_SUBJECTS_BY_FIELD.sayisal;
  }, [examTier, field]);

  const canSave = !!subject && topic.trim() && duration;

  const handleSwitchTier = (tier) => {
    setExamTier(tier);
    setSubject(null); // ders sıfırla, set değişiyor
  };

  const save = useCallback(async () => {
    if (saving || !canSave) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const qc = parseInt(questionCount, 10) || 0;
    const localLog = {
      id: Date.now().toString(),
      subject,
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
      subject,
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
  }, [saving, canSave, subject, topic, duration, questionCount, notes, examTier, user, dispatch, reward, navigation]);

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
                selected={subject === sub.key}
                onPress={() => setSubject(sub.key)}
                C={C}
              />
            ))}
          </View>

          {/* === Konu === */}
          <Text style={[s.label, { color: C.muted, marginTop: 22 }]}>KONU</Text>
          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder="Örn. Türev, Köklü Sayılar..."
            placeholderTextColor={C.muted}
            style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]}
            maxLength={60}
          />

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

        <XPToast amount={xpToast.amount} visible={xpToast.visible} onDone={dismissXP} />
        <BadgeUnlockModal badge={badgeModal.badge} visible={badgeModal.visible} onClose={dismissBadge} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SubjectChip({ subject, selected, onPress, C }) {
  const id = useSubjectIdentity(subject.key);
  const color = id?.solid || C.purple;
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
        {subject.name}
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
