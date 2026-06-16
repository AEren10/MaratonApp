import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import Svg, { Circle } from "react-native-svg";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { getSubjectByKey } from "../../themes/subjects";
import { useAppDispatch } from "../../store/hooks";
import { addLog } from "../../store/slices/studyLogSlice";
import { useGamification } from "../../hooks/useGamification";
import { XPToast } from "../../components/common/XPToast";
import { BadgeUnlockModal } from "../../components/common/BadgeUnlockModal";
import { useAuth } from "../../contexts/AuthContext";
import { saveStudyLogOffline } from "../../lib/offlineQueue";
import { SCREENS } from "../../constants/screens";

function buildModes(C) {
  return [
    { key: "FREE", label: "Serbest", color: C.text, focus: 0, break: 0, longBreak: 0, cycles: 0 },
    { key: "POMODORO_25", label: "Pomodoro 25/5", color: C.amber, focus: 25, break: 5, longBreak: 15, cycles: 4 },
    { key: "POMODORO_50", label: "Pomodoro 50/10", color: C.blue, focus: 50, break: 10, longBreak: 20, cycles: 3 },
    { key: "DEEP_90", label: "Derin Odak 90", color: C.purple, focus: 90, break: 20, longBreak: 30, cycles: 2 },
  ];
}

const PHASE = {
  FOCUS: "FOCUS",
  BREAK: "BREAK",
  LONG_BREAK: "LONG_BREAK",
};

function TimerRing({ size = 240, stroke = 10, pct = 0, color, secondary, children, C }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(Math.max(pct, 0), 1));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={secondary || C.border} strokeWidth={stroke} fill="none" />
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

export default function StudyTimerScreen() {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const MODES = useMemo(() => buildModes(C), [C]);
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { reward, xpToast, dismissXP, badgeModal, dismissBadge } = useGamification();
  const { subjectKey, topicName } = route.params ?? {};

  const subject = getSubjectByKey(subjectKey || "matematik") || { key: "matematik", label: "Matematik", color: C.amber, icon: "hash" };
  const topic = topicName || "Çalışma";

  const [modeKey, setModeKey] = useState("FREE");
  const mode = useMemo(() => MODES.find((m) => m.key === modeKey), [modeKey, MODES]);

  const [phase, setPhase] = useState(PHASE.FOCUS);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);
  const [questions, setQuestions] = useState(0);
  const [saving, setSaving] = useState(false);
  const interval = useRef(null);

  // For pomodoro modes, target time of current phase. For free, no target.
  const phaseTargetSec = useMemo(() => {
    if (modeKey === "FREE") return 25 * 60;
    if (phase === PHASE.FOCUS) return mode.focus * 60;
    if (phase === PHASE.BREAK) return mode.break * 60;
    return mode.longBreak * 60;
  }, [modeKey, phase, mode]);

  const isPomodoro = modeKey !== "FREE";

  const phaseColor = phase === PHASE.FOCUS ? mode.color : phase === PHASE.BREAK ? C.green : C.teal;
  const phaseLabel = phase === PHASE.FOCUS
    ? `Odak ${cycleIndex + 1}/${mode.cycles || 1}`
    : phase === PHASE.BREAK ? "Kısa Mola" : "Uzun Mola";

  const advancePhase = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (!isPomodoro) {
      setRunning(false);
      return;
    }
    if (phase === PHASE.FOCUS) {
      // Add to focus seconds before moving on
      setTotalFocusSeconds((s) => s + phaseTargetSec);
      const nextCycle = cycleIndex + 1;
      if (nextCycle >= mode.cycles) {
        // last cycle done — long break or finish
        setPhase(PHASE.LONG_BREAK);
        setCycleIndex(0);
      } else {
        setPhase(PHASE.BREAK);
        setCycleIndex(nextCycle);
      }
    } else {
      // mola bitti → odak
      setPhase(PHASE.FOCUS);
    }
    setElapsed(0);
  }, [isPomodoro, phase, cycleIndex, mode, phaseTargetSec]);

  useEffect(() => {
    if (running) {
      interval.current = setInterval(() => {
        setElapsed((p) => {
          const next = p + 1;
          if (isPomodoro && next >= phaseTargetSec) {
            // schedule phase change for next tick
            setTimeout(advancePhase, 0);
            return phaseTargetSec;
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval.current);
    }
    return () => clearInterval(interval.current);
  }, [running, isPomodoro, phaseTargetSec, advancePhase]);

  // Track total focus seconds for FREE mode based on elapsed.
  useEffect(() => {
    if (!isPomodoro) {
      setTotalFocusSeconds(elapsed);
    }
  }, [elapsed, isPomodoro]);

  const toggle = useCallback(() => {
    setRunning((p) => !p);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const skipPhase = useCallback(() => {
    advancePhase();
  }, [advancePhase]);

  const addQ = useCallback(() => {
    setQuestions((p) => p + 1);
    Haptics.selectionAsync().catch(() => {});
  }, []);
  const removeQ = useCallback(() => setQuestions((p) => Math.max(0, p - 1)), []);

  const pct = Math.min(elapsed / phaseTargetSec, 1);

  const handleModeChange = useCallback((key) => {
    if (elapsed > 30) {
      Alert.alert("Modu değiştir", "Çalışman sıfırlanacak. Emin misin?", [
        { text: "İptal", style: "cancel" },
        {
          text: "Değiştir",
          onPress: () => {
            setModeKey(key);
            setPhase(PHASE.FOCUS);
            setElapsed(0);
            setCycleIndex(0);
            setRunning(false);
            setTotalFocusSeconds(0);
          },
        },
      ]);
    } else {
      setModeKey(key);
      setPhase(PHASE.FOCUS);
      setElapsed(0);
      setCycleIndex(0);
      setRunning(false);
      setTotalFocusSeconds(0);
    }
  }, [elapsed]);

  const finish = useCallback(async () => {
    if (saving) return;
    setRunning(false);

    const focusForSave = isPomodoro
      ? totalFocusSeconds + (phase === PHASE.FOCUS ? elapsed : 0)
      : elapsed;

    if (focusForSave < 30) {
      Alert.alert("Çok kısa", "30 saniyeden az çalışma kaydedilmez.", [
        { text: "Çık", onPress: () => navigation.goBack() },
        { text: "Devam", style: "cancel" },
      ]);
      return;
    }

    const minutes = Math.max(1, Math.round(focusForSave / 60));
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

    navigation.replace(SCREENS.STUDY_SUMMARY, {
      subjectLabel: subject.label || subject.name,
      subjectColor: subject.color,
      subjectIcon: subject.icon,
      topic,
      duration: minutes,
      questions,
    });
  }, [elapsed, totalFocusSeconds, phase, isPomodoro, questions, subject, topic, user, dispatch, reward, navigation, saving]);

  const exit = useCallback(() => {
    if (elapsed >= 30 || totalFocusSeconds >= 30) {
      Alert.alert("Çıkış", "Çalışmayı kaydetmeden çıkmak istiyor musun?", [
        { text: "İptal", style: "cancel" },
        { text: "Çıkış", style: "destructive", onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.goBack();
    }
  }, [elapsed, totalFocusSeconds, navigation]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={exit} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <View style={styles.subjectBadge}>
          <View style={[styles.dot, { backgroundColor: subject.color }]} />
          <Text style={[TYPOGRAPHY.captionMedium, { color: subject.color }]}>{subject.label || subject.name}</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      {/* Mode selector */}
      <View style={styles.modeRow}>
        {MODES.map((m) => {
          const active = m.key === modeKey;
          return (
            <Pressable
              key={m.key}
              onPress={() => handleModeChange(m.key)}
              style={[
                styles.modeChip,
                { borderColor: active ? m.color : C.border, backgroundColor: active ? m.color + "20" : "transparent" },
              ]}
            >
              <Text
                style={{
                  ...TYPOGRAPHY.captionMedium,
                  color: active ? m.color : C.muted,
                  fontSize: 11,
                }}
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.center}>
        <Text style={[TYPOGRAPHY.label, { color: phaseColor, marginBottom: 4 }]}>
          {isPomodoro ? phaseLabel.toUpperCase() : ""}
        </Text>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.sec, marginBottom: SPACING.lg }]}>
          {topic}
        </Text>

        <TimerRing size={240} stroke={10} pct={pct} color={phaseColor} C={C}>
          <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>{fmt(elapsed)}</Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.muted, marginTop: 4 }]}>
            / {isPomodoro ? `${Math.floor(phaseTargetSec / 60)} dk` : "serbest"}
          </Text>
        </TimerRing>

        <View style={styles.controls}>
          {isPomodoro && (
            <Pressable onPress={skipPhase} style={styles.sideBtn}>
              <Icon name="chevR" size={20} color={C.muted} />
            </Pressable>
          )}
          <Pressable onPress={toggle} style={[styles.mainBtn, { backgroundColor: phaseColor }]}>
            <Icon name={running ? "pause" : "play"} size={28} color={C.bg} />
          </Pressable>
          {isPomodoro && (
            <View style={styles.sideBtn}>
              <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.muted }}>
                {fmt(totalFocusSeconds)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.questionRow}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.sec }]}>Çözülen soru</Text>
          <View style={styles.stepper}>
            <Pressable onPress={removeQ} hitSlop={8} style={styles.stepBtn}>
              <Text style={[TYPOGRAPHY.subheading, { color: C.muted }]}>-</Text>
            </Pressable>
            <Text style={[TYPOGRAPHY.statSmall, { color: C.text, minWidth: 40, textAlign: "center" }]}>
              {questions}
            </Text>
            <Pressable onPress={addQ} hitSlop={8} style={styles.stepBtn}>
              <Text style={[TYPOGRAPHY.subheading, { color: phaseColor }]}>+</Text>
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
        <Text style={[TYPOGRAPHY.button, { color: C.bg }]}>
          {saving ? "Kaydediliyor..." : "Bitir ve Kaydet"}
        </Text>
      </Pressable>
      <XPToast amount={xpToast.amount} visible={xpToast.visible} onDone={dismissXP} />
      <BadgeUnlockModal badge={badgeModal.badge} visible={badgeModal.visible} onClose={dismissBadge} />
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
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
    modeRow: {
      flexDirection: "row",
      gap: SPACING.xs,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      flexWrap: "wrap",
    },
    modeChip: {
      paddingHorizontal: SPACING.md,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },
    center: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 40 },
    controls: {
      flexDirection: "row", alignItems: "center", gap: SPACING.xl, marginTop: SPACING.xxxl,
    },
    sideBtn: {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: C.surface2, alignItems: "center", justifyContent: "center",
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
}
