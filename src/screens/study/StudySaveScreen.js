import { useState, useCallback, useMemo } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC, useSubjectIdentity } from "../../contexts/ThemeContext";
import { useAppDispatch } from "../../store/hooks";
import { addLog, setStreak, setFreezeCount } from "../../store/slices/studyLogSlice";
import { computeStreakUpdate } from "../../lib/streakFreeze";
import { useGamification } from "../../hooks/useGamification";
import { captureError } from "../../lib/errorReporting";
import { useCurriculum } from "../../hooks/useCurriculum";
import { XPBoostToast } from "../../components/common/XPBoostToast";
import { BadgeUnlockModal } from "../../components/common/BadgeUnlockModal";
import { useAuth } from "../../contexts/AuthContext";
import { getStreak, updateStreak } from "../../supabase/streaks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveStudyLogOffline } from "../../lib/offlineQueue";
import { syncChallengeProgress } from "../../lib/challengeSync";
import { STORAGE_KEYS } from "../../constants/storageKeys";
import { TopicPicker } from "../wrong-notebook/components/TopicPicker";
import { studyLogSchema } from "../../validations/auth";
import { SCREENS } from "../../constants/screens";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

function SubjectChip({ subject, selected, onPress, C }) {
  const id = useSubjectIdentity(subject.key);
  const color = id?.solid || subject.color || C.purple;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.subjChip,
        {
          backgroundColor: selected ? color : color + "10",
          borderColor: selected ? color : color + "24",
        },
      ]}
    >
      <View style={[
        styles.subjIconBox,
        { backgroundColor: selected ? "rgba(255,255,255,0.22)" : color + "1A" },
      ]}>
        <Icon name={subject.icon} size={16} color={selected ? "#FFFFFF" : color} />
      </View>
      <Text style={[styles.subjName, { color: selected ? "#FFFFFF" : C.text }]} numberOfLines={1}>
        {subject.label || subject.name}
      </Text>
    </Pressable>
  );
}

export default function StudySaveScreen() {
  const navigation = useNavigation();
  const C = useC();
  const showAlert = useAlert();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { tytSubjects, aytSubjects, group1Label, group2Label } = useCurriculum();
  const { reward, xpToast, dismissXP, badgeModal, dismissBadge } = useGamification();
  const route = useRoute();

  const {
    duration = 0,
    questions: initQuestions = 0,
    correctCount: initCorrect = 0,
    subjectKey: preSubjectKey,
    topicName: preTopic,
  } = route.params ?? {};

  const [examTier, setExamTier] = useState(() => {
    if (preSubjectKey) {
      const isAyt = aytSubjects.some((s) => s.key === preSubjectKey);
      return isAyt ? "AYT" : "TYT";
    }
    return "TYT";
  });
  const [subjectKey, setSubjectKey] = useState(preSubjectKey || null);
  const [topic, setTopic] = useState(preTopic || "");
  const [topicPickerOpen, setTopicPickerOpen] = useState(false);
  const [questionCount, setQC] = useState(initQuestions > 0 ? String(initQuestions) : "");
  const [correctCount, setCC] = useState(initCorrect > 0 ? String(initCorrect) : "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const subjects = useMemo(() => {
    return examTier === "TYT" ? tytSubjects : aytSubjects;
  }, [examTier, tytSubjects, aytSubjects]);

  const currentSubject = useMemo(
    () => subjects.find((s) => s.key === subjectKey) || null,
    [subjects, subjectKey],
  );

  const canSave = !!subjectKey;

  const handleSwitchTier = (tier) => {
    setExamTier(tier);
    setSubjectKey(null);
    setTopic("");
  };

  const handleSelectSubject = (key) => {
    H.select();
    setSubjectKey(key);
    setTopic("");
  };

  const save = useCallback(async () => {
    if (saving || !canSave) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const qc = parseInt(questionCount, 10) || 0;
    const cc = parseInt(correctCount, 10) || 0;
    const topicVal = topic.trim() || (currentSubject?.label || subjectKey);

    const notesVal = notes.trim() || undefined;
    const parsed = studyLogSchema.safeParse({
      subject: subjectKey,
      topic: topicVal,
      questionCount: qc,
      correctCount: cc,
      duration,
      notes: notesVal,
    });
    if (!parsed.success) {
      H.warn();
      showAlert("Hata", parsed.error.issues[0]?.message || "Geçersiz değer");
      return;
    }

    dispatch(addLog({
      id: Date.now().toString(),
      subject: subjectKey,
      topic: topicVal,
      questionCount: qc,
      correctCount: cc,
      duration,
      notes: notesVal,
      study_date: todayStr,
    }));

    setSaving(true);
    const result = await saveStudyLogOffline({
      user_id: user.id,
      subject: subjectKey,
      topic: topicVal,
      question_count: qc,
      correct_count: cc,
      duration_minutes: duration,
      study_date: todayStr,
      ...(notesVal ? { notes: notesVal } : {}),
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
          AsyncStorage.setItem(STORAGE_KEYS.PENDING_STREAK, JSON.stringify({ userId: user.id, updates })).catch(() => {});
        }
        if (usedFreeze) {
          showAlert("🛡 Joker kullanıldı", "Bir gün atlamıştın ama jokerin streak'ini korudu!");
        }
      } catch (e) { captureError(e, { context: "streak_update_studySave" }); }
      syncChallengeProgress(user.id, { questions: qc, minutes: duration });
    } else if (result.queued) {
      const msg = result.error?.message || "";
      const isNetwork = msg.includes("network") || msg.includes("fetch");
      showAlert(
        isNetwork ? "Çevrimdışı" : "Kayıt beklemede",
        isNetwork
          ? "İnternet yok, kayıt bağlantı geldiğinde otomatik gönderilecek."
          : "Kayıt sıraya alındı, kısa süre içinde gönderilecek.",
      );
    }
    setSaving(false);

    reward("study_log", {
      minutes: duration,
      statUpdates: [
        { type: "increment", key: "totalQuestions", value: qc },
        { type: "increment", key: "totalMinutes", value: duration },
      ],
    });
    if (qc > 0) reward("question_solved", { count: qc });

    H.success();
    navigation.replace(SCREENS.STUDY_SUMMARY, {
      subjectLabel: currentSubject?.label || currentSubject?.name || subjectKey,
      subjectColor: currentSubject?.color || C.purple,
      subjectIcon: currentSubject?.icon || "bookOpen",
      topic: topicVal,
      duration,
      questions: qc,
    });
  }, [saving, canSave, subjectKey, topic, notes, duration, questionCount, correctCount, user, dispatch, reward, navigation, currentSubject, C]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={[styles.closeBtn, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Icon name="arrowL" size={18} color={C.text} />
          </Pressable>
          <Text style={[styles.title, { color: C.text }]}>Ne çalıştın?</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Duration badge */}
          <Animated.View entering={FadeInDown.delay(0).duration(420).springify()}>
            <View style={[styles.durationBadge, { backgroundColor: C.green + "14", borderColor: C.green + "30" }]}>
              <Icon name="clock" size={18} color={C.green} />
              <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 22, color: C.green, letterSpacing: -0.3 }}>
                {duration} dk
              </Text>
              <Text style={{ ...TYPOGRAPHY.caption, color: C.sec }}>çalışıldı</Text>
            </View>
          </Animated.View>

          {/* Exam tier */}
          {!preSubjectKey && (
            <Animated.View entering={FadeInDown.delay(70).duration(420).springify()}>
              <Text style={[styles.label, { color: C.muted }]}>SINAV TİPİ</Text>
              <View style={[styles.tierRow, { backgroundColor: C.surface, borderColor: C.border }]}>
                {[["TYT", group1Label, C.blue], ["AYT", group2Label, C.purple]].map(([t, lbl, clr]) => {
                  const active = examTier === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => handleSwitchTier(t)}
                      style={[styles.tierBtn, {
                        backgroundColor: active ? clr : "transparent",
                        borderColor: active ? clr : "transparent",
                      }]}
                    >
                      <Text style={[styles.tierTitle, { color: active ? "#FFFFFF" : clr }]}>{lbl}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* Subject grid */}
          <Animated.View entering={FadeInDown.delay(preSubjectKey ? 70 : 140).duration(420).springify()}>
            <Text style={[styles.label, { color: C.muted, marginTop: 22 }]}>DERS *</Text>
            <View style={styles.subjectGrid}>
              {subjects.map((sub) => (
                <SubjectChip key={sub.key} subject={sub} selected={subjectKey === sub.key} onPress={() => handleSelectSubject(sub.key)} C={C} />
              ))}
            </View>
          </Animated.View>

          {/* Topic */}
          <Animated.View entering={FadeInDown.delay(preSubjectKey ? 140 : 210).duration(420).springify()}>
            <Text style={[styles.label, { color: C.muted, marginTop: 22 }]}>KONU (isteğe bağlı)</Text>
            <Pressable
              onPress={() => {
                if (!currentSubject) { H.warn(); showAlert("Önce ders seç", "Konu listesi için ders seçmelisin."); return; }
                H.select();
                setTopicPickerOpen(true);
              }}
              style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
            >
              <Text style={{ ...TYPOGRAPHY.body, color: topic ? C.text : C.muted, fontSize: 15 }}>
                {topic || "Konu seç..."}
              </Text>
              <Icon name="chevDown" size={16} color={C.muted} />
            </Pressable>
          </Animated.View>

          {/* Questions */}
          <Animated.View entering={FadeInDown.delay(preSubjectKey ? 210 : 280).duration(420).springify()}>
            <Text style={[styles.label, { color: C.muted, marginTop: 22 }]}>SORU SAYISI (isteğe bağlı)</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TextInput
                style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text, flex: 1 }]}
                placeholder="0"
                placeholderTextColor={C.muted}
                keyboardType="number-pad"
                value={questionCount}
                onChangeText={setQC}
              />
              <TextInput
                style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text, flex: 1 }]}
                placeholder="Doğru"
                placeholderTextColor={C.muted}
                keyboardType="number-pad"
                value={correctCount}
                onChangeText={setCC}
              />
            </View>
          </Animated.View>

          {/* Notes */}
          <Animated.View entering={FadeInDown.delay(preSubjectKey ? 280 : 350).duration(420).springify()}>
            <Text style={[styles.label, { color: C.muted, marginTop: 22 }]}>NOT (isteğe bağlı)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Kendine bir not bırak..."
              placeholderTextColor={C.muted}
              multiline
              maxLength={140}
              style={[styles.noteInput, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
            />
            <Text style={[styles.charCount, { color: C.muted }]}>{notes.length}/140</Text>
          </Animated.View>
        </ScrollView>

        {/* Bottom save button */}
        <View style={[styles.bottomBar, { backgroundColor: C.bg, borderTopColor: C.border }]}>
          <Pressable
            onPress={save}
            disabled={!canSave || saving}
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: canSave ? C.accent : C.surface2,
                shadowColor: canSave ? C.accent : "transparent",
                opacity: pressed ? 0.92 : saving ? 0.6 : 1,
              },
            ]}
          >
            <Icon name="check" size={20} color={canSave ? "#FFFFFF" : C.muted} sw={2.5} />
            <Text style={[styles.submitText, { color: canSave ? "#FFFFFF" : C.muted }]}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {currentSubject && topicPickerOpen && (
        <TopicPicker
          visible={topicPickerOpen}
          subject={currentSubject}
          onSelect={(t) => { setTopic(t); setTopicPickerOpen(false); }}
          onClose={() => setTopicPickerOpen(false)}
        />
      )}
      <XPBoostToast amount={xpToast.amount} visible={xpToast.visible} multiplier={xpToast.multiplier} onDismiss={dismissXP} />
      <BadgeUnlockModal badge={badgeModal.badge} visible={badgeModal.visible} onClose={dismissBadge} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  title: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 18 },
  scroll: { padding: SPACING.lg, paddingBottom: 140 },
  label: { ...TYPOGRAPHY.label, marginBottom: 10, letterSpacing: 0.7 },

  durationBadge: {
    flexDirection: "row", alignItems: "center", gap: 10,
    alignSelf: "center", paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    borderRadius: RADIUS.full, borderWidth: 1, marginBottom: SPACING.lg,
  },

  tierRow: {
    flexDirection: "row", borderRadius: RADIUS.xl, borderWidth: 1, padding: 4, gap: 4,
  },
  tierBtn: {
    flex: 1, paddingVertical: 14, borderRadius: RADIUS.lg, borderWidth: 1.5,
    alignItems: "center",
  },
  tierTitle: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 18, letterSpacing: -0.3 },

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

  bottomBar: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    padding: SPACING.lg, borderTopWidth: 1,
  },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 999, paddingVertical: 17,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.30, shadowRadius: 18, elevation: 6,
  },
  submitText: { fontFamily: "Inter_600SemiBold", fontSize: 16 },

  noteInput: {
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14,
    fontFamily: "Inter_400Regular", fontSize: 15, minHeight: 80, textAlignVertical: "top",
  },
  charCount: { ...TYPOGRAPHY.micro, textAlign: "right", marginTop: 4 },
});
