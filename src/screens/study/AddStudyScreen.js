import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { C, SPACING } from "../../themes/tokens";
import { SubjectPicker } from "./components/SubjectPicker";
import { StudyForm } from "./components/StudyForm";
import { useAppDispatch } from "../../store/hooks";
import { addLog, setStreak, setFreezeCount } from "../../store/slices/studyLogSlice";
import { computeStreakUpdate } from "../../lib/streakFreeze";
import { useGamification } from "../../hooks/useGamification";
import { XPToast } from "../../components/common/XPToast";
import { BadgeUnlockModal } from "../../components/common/BadgeUnlockModal";
import { useAuth } from "../../contexts/AuthContext";
import { getStreak, updateStreak } from "../../supabase/streaks";
import { saveStudyLogOffline } from "../../lib/offlineQueue";

const INITIAL = {
  subject: null,
  topic: "",
  questionCount: 0,
  duration: null,
  notes: "",
};

export default function AddStudyScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { reward, xpToast, dismissXP, badgeModal, dismissBadge } = useGamification();
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  const canSave = form.subject && form.topic.trim() && form.duration;

  const save = useCallback(async () => {
    if (saving) return;
    if (!form.subject) {
      Alert.alert("Ders sec", "Hangi ders icin calistin?");
      return;
    }
    if (!form.topic.trim()) {
      Alert.alert("Konu eksik", "Hangi konuyu calistin?");
      return;
    }
    if (!form.duration) {
      Alert.alert("Sure sec", "Ne kadar calistin?");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const localLog = {
      id: Date.now().toString(),
      subject: form.subject,
      topic: form.topic.trim(),
      questionCount: form.questionCount,
      duration: form.duration,
      notes: form.notes,
      study_date: todayStr,
    };
    dispatch(addLog(localLog));

    setSaving(true);
    const result = await saveStudyLogOffline({
      user_id: user.id,
      subject: form.subject,
      topic: form.topic.trim(),
      question_count: form.questionCount || 0,
      correct_count: 0,
      duration_minutes: form.duration,
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

    const minutes = form.duration || 0;
    const statUpdates = [
      { type: "increment", key: "totalQuestions", value: form.questionCount || 0 },
      { type: "increment", key: "totalMinutes", value: minutes },
    ];
    reward("study_log", { minutes, statUpdates });
    if (form.questionCount > 0) {
      reward("question_solved", { count: form.questionCount });
    }

    navigation.goBack();
  }, [form, navigation, dispatch, saving, user]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Header onClose={() => navigation.goBack()} />

        <ScrollView
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SectionLabel>Ders</SectionLabel>
          <SubjectPicker
            selected={form.subject}
            onSelect={(key) => setForm((p) => ({ ...p, subject: key }))}
          />
          <StudyForm form={form} setForm={setForm} />
        </ScrollView>

        <SubmitBar onSave={save} disabled={!canSave} />
        <XPToast amount={xpToast.amount} visible={xpToast.visible} onDone={dismissXP} />
        <BadgeUnlockModal badge={badgeModal.badge} visible={badgeModal.visible} onClose={dismissBadge} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Header({ onClose }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
      }}
    >
      <Pressable
        onPress={onClose}
        hitSlop={10}
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: C.surface,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: C.border,
        }}
      >
        <Icon name="x" size={18} color={C.text} />
      </Pressable>
      <Text
        style={{
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 17,
          color: C.text,
        }}
      >
        Calisma Kaydet
      </Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

function SectionLabel({ children }) {
  return (
    <Text
      style={{
        fontFamily: "Inter_600SemiBold",
        fontSize: 12,
        color: C.sec,
        marginBottom: SPACING.sm,
        letterSpacing: 0.4,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Text>
  );
}

function SubmitBar({ onSave, disabled }) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.lg,
        backgroundColor: C.bg,
        borderTopWidth: 1,
        borderTopColor: C.border,
      }}
    >
      <Pressable
        onPress={onSave}
        disabled={disabled}
        style={({ pressed }) => ({
          backgroundColor: disabled ? C.surface2 : C.amber,
          borderRadius: 16,
          paddingVertical: 16,
          alignItems: "center",
          opacity: pressed && !disabled ? 0.85 : 1,
        })}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 15,
            color: disabled ? C.muted : C.bg,
          }}
        >
          Kaydet
        </Text>
      </Pressable>
    </View>
  );
}
