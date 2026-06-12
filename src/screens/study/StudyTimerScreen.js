import { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";

import { Icon } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { getSubjectByKey } from "../../themes/subjects";
import { useAppDispatch } from "../../store/hooks";
import { addLog } from "../../store/slices/studyLogSlice";
import { useGamification } from "../../hooks/useGamification";
import { XPToast } from "../../components/common/XPToast";
import { BadgeUnlockModal } from "../../components/common/BadgeUnlockModal";
import { useAuth } from "../../contexts/AuthContext";
import { saveStudyLogOffline } from "../../lib/offlineQueue";

function TimerRing({ size = 200, stroke = 8, pct = 0, color, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(Math.max(pct, 0), 1));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

const fmt = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
};

const GOAL_MINUTES = 25;

export default function StudyTimerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { reward, xpToast, dismissXP, badgeModal, dismissBadge } = useGamification();
  const { subjectKey, topicName } = route.params ?? {};

  const subject = getSubjectByKey(subjectKey || "matematik") || { key: "matematik", label: "Matematik", color: "#F5A623", icon: "hash" };
  const topic = topicName || "Çalışma";

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [questions, setQuestions] = useState(0);
  const [saving, setSaving] = useState(false);
  const interval = useRef(null);

  useEffect(() => {
    if (running) {
      interval.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    } else {
      clearInterval(interval.current);
    }
    return () => clearInterval(interval.current);
  }, [running]);

  const toggle = useCallback(() => setRunning((p) => !p), []);
  const addQ = useCallback(() => setQuestions((p) => p + 1), []);
  const removeQ = useCallback(() => setQuestions((p) => Math.max(0, p - 1)), []);

  const goalSec = GOAL_MINUTES * 60;
  const pct = Math.min(elapsed / goalSec, 1);

  const finish = useCallback(async () => {
    if (saving) return;
    setRunning(false);

    if (elapsed < 30) {
      Alert.alert("Çok kısa", "30 saniyeden az çalışma kaydedilmez.", [
        { text: "Tamam", onPress: () => navigation.goBack() },
        { text: "Devam Et", style: "cancel" },
      ]);
      return;
    }

    const minutes = Math.max(1, Math.round(elapsed / 60));
    const todayStr = new Date().toISOString().split("T")[0];

    dispatch(addLog({
      id: Date.now().toString(),
      subject: subject.key,
      topic,
      questionCount: questions,
      duration: minutes,
      study_date: todayStr,
    }));

    setSaving(true);
    if (user?.id && user.id !== "dev") {
      await saveStudyLogOffline({
        user_id: user.id,
        subject: subject.key,
        topic,
        question_count: questions,
        correct_count: 0,
        duration_minutes: minutes,
        study_date: todayStr,
      });
    }
    setSaving(false);

    reward("study_log", {
      minutes,
      statUpdates: [
        { type: "increment", key: "totalQuestions", value: questions },
        { type: "increment", key: "totalMinutes", value: minutes },
      ],
    });
    if (questions > 0) reward("question_solved", { count: questions });

    Alert.alert(
      "Kaydedildi",
      `${minutes} dk • ${questions} soru`,
      [{ text: "Tamam", onPress: () => navigation.goBack() }],
    );
  }, [elapsed, questions, subject, topic, user, dispatch, reward, navigation, saving]);

  const exit = useCallback(() => {
    if (elapsed >= 30) {
      Alert.alert("Cikis", "Calismayi kaydetmeden cikmak istediginden emin misin?", [
        { text: "Iptal", style: "cancel" },
        { text: "Cikis", style: "destructive", onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.goBack();
    }
  }, [elapsed, navigation]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={exit} hitSlop={12}>
          <Icon name="x" size={22} color={C.text} />
        </Pressable>
        <View style={styles.subjectBadge}>
          <View style={[styles.dot, { backgroundColor: subject.color }]} />
          <Text style={[TYPOGRAPHY.captionMedium, { color: subject.color }]}>{subject.label || subject.name}</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.center}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.sec, marginBottom: SPACING.sm }]}>
          {topic}
        </Text>

        <TimerRing size={220} stroke={8} pct={pct} color={subject.color}>
          <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>{fmt(elapsed)}</Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.muted, marginTop: 4 }]}>
            / {GOAL_MINUTES} dk hedef
          </Text>
        </TimerRing>

        <View style={styles.controls}>
          <Pressable onPress={toggle} style={[styles.mainBtn, { backgroundColor: subject.color }]}>
            <Icon name={running ? "pause" : "play"} size={28} color={C.bg} />
          </Pressable>
        </View>

        <View style={styles.questionRow}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.sec }]}>Cozulen soru</Text>
          <View style={styles.stepper}>
            <Pressable onPress={removeQ} hitSlop={8} style={styles.stepBtn}>
              <Text style={[TYPOGRAPHY.subheading, { color: C.muted }]}>-</Text>
            </Pressable>
            <Text style={[TYPOGRAPHY.statSmall, { color: C.text, minWidth: 40, textAlign: "center" }]}>
              {questions}
            </Text>
            <Pressable onPress={addQ} hitSlop={8} style={styles.stepBtn}>
              <Text style={[TYPOGRAPHY.subheading, { color: subject.color }]}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable
        onPress={finish}
        disabled={saving}
        style={[styles.finishBtn, saving && { opacity: 0.6 }]}
      >
        <Icon name="check" size={20} color={C.bg} />
        <Text style={[TYPOGRAPHY.button, { color: C.bg }]}>{saving ? "Kaydediliyor..." : "Bitir ve Kaydet"}</Text>
      </Pressable>
      <XPToast amount={xpToast.amount} visible={xpToast.visible} onDone={dismissXP} />
      <BadgeUnlockModal badge={badgeModal.badge} visible={badgeModal.visible} onClose={dismissBadge} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  subjectBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: C.surface, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 40 },
  controls: {
    flexDirection: "row", alignItems: "center", gap: SPACING.xl, marginTop: SPACING.xxxl,
  },
  mainBtn: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
    ...SHADOWS.card,
  },
  questionRow: {
    flexDirection: "row", alignItems: "center", gap: SPACING.lg,
    marginTop: SPACING.xxxl, backgroundColor: C.surface,
    borderRadius: RADIUS.xl, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
  stepper: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  stepBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surface2, alignItems: "center", justifyContent: "center",
  },
  finishBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm,
    backgroundColor: C.amber, borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.lg, marginBottom: SPACING.xxl, paddingVertical: SPACING.lg,
    ...SHADOWS.amber,
  },
});
