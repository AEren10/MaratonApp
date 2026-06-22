import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import Svg, { Circle } from "react-native-svg";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { getSubjectByKey } from "../../themes/subjects";
import { SCREENS } from "../../constants/screens";
import { useAlert } from "../../contexts/AlertContext";
import { SubjectPicker } from "./components/SubjectPicker";

function buildModes(C) {
  return [
    { key: "FREE", label: "Serbest", icon: "zap", desc: "Süresiz — istediğin zaman bitir", color: C.text, focus: 0, break: 0, longBreak: 0, cycles: 0 },
    { key: "POMODORO_25", label: "25/5", icon: "timer", desc: "25 dk odak + 5 dk mola × 4 tur", color: C.amber, focus: 25, break: 5, longBreak: 15, cycles: 4 },
    { key: "POMODORO_50", label: "50/10", icon: "timer", desc: "50 dk odak + 10 dk mola × 3 tur", color: C.blue, focus: 50, break: 10, longBreak: 20, cycles: 3 },
    { key: "DEEP_90", label: "90 dk", icon: "timer", desc: "Sınav modu — 90dk kesintisiz", color: C.purple, focus: 90, break: 20, longBreak: 30, cycles: 2 },
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
  const showAlert = useAlert();
  const styles = useMemo(() => makeStyles(C), [C]);
  const MODES = useMemo(() => buildModes(C), [C]);
  const navigation = useNavigation();
  const route = useRoute();
  const { subjectKey: routeSubjectKey, topicName } = route.params ?? {};

  const [selectedSubjectKey, setSelectedSubjectKey] = useState(routeSubjectKey || null);
  const topic = topicName || "";

  const subject = selectedSubjectKey
    ? (getSubjectByKey(selectedSubjectKey) || { key: selectedSubjectKey, label: selectedSubjectKey, color: C.amber, icon: "bookOpen" })
    : { key: null, label: "Ders Seçilmedi", color: C.muted, icon: "clock" };
  const hasSubject = !!selectedSubjectKey;

  const [modeKey, setModeKey] = useState("FREE");
  const mode = useMemo(() => MODES.find((m) => m.key === modeKey), [modeKey, MODES]);

  const [phase, setPhase] = useState(PHASE.FOCUS);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);
  const [questions, setQuestions] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const interval = useRef(null);
  const phaseTimeout = useRef(null);

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
            phaseTimeout.current = setTimeout(advancePhase, 0);
            return phaseTargetSec;
          }
          return next;
        });
      }, 1000);
    } else if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
      clearTimeout(phaseTimeout.current);
    };
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
  const removeQ = useCallback(() => {
    setQuestions((p) => {
      const next = Math.max(0, p - 1);
      setCorrectCount((c) => Math.min(c, next));
      return next;
    });
  }, []);
  const addCC = useCallback(() => {
    setCorrectCount((c) => Math.min(c + 1, questions));
    Haptics.selectionAsync().catch(() => {});
  }, [questions]);
  const removeCC = useCallback(() => setCorrectCount((c) => Math.max(0, c - 1)), []);

  const pct = Math.min(elapsed / phaseTargetSec, 1);

  const handleModeChange = useCallback((key) => {
    if (elapsed > 30) {
      showAlert("Modu değiştir", "Çalışman sıfırlanacak. Emin misin?", [
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

  const finish = useCallback(() => {
    setRunning(false);

    const focusForSave = isPomodoro
      ? totalFocusSeconds + (phase === PHASE.FOCUS ? elapsed : 0)
      : elapsed;

    if (focusForSave < 30) {
      showAlert("Çok kısa", "30 saniyeden az çalışma kaydedilmez.", [
        { text: "Çık", onPress: () => navigation.goBack() },
        { text: "Devam", style: "cancel" },
      ]);
      return;
    }

    const minutes = Math.max(1, Math.round(focusForSave / 60));

    navigation.replace(SCREENS.STUDY_SAVE, {
      duration: minutes,
      questions,
      correctCount,
      subjectKey: selectedSubjectKey || undefined,
      topicName: topic || undefined,
    });
  }, [elapsed, totalFocusSeconds, phase, isPomodoro, questions, correctCount, selectedSubjectKey, topic, navigation]);

  const exit = useCallback(() => {
    if (elapsed >= 30 || totalFocusSeconds >= 30) {
      showAlert("Çıkış", "Çalışmayı kaydetmeden çıkmak istiyor musun?", [
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
        <Pressable onPress={exit} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <View style={styles.subjectBadge}>
          <View style={[styles.dot, { backgroundColor: subject.color }]} />
          <Text style={[TYPOGRAPHY.captionMedium, { color: hasSubject ? subject.color : C.sec }]}>
            {hasSubject ? (subject.label || subject.name) : "Serbest Çalışma"}
          </Text>
        </View>
        <Pressable onPress={() => navigation.navigate(SCREENS.STUDY_HISTORY)} hitSlop={12} accessibilityLabel="Geçmiş" accessibilityRole="button">
          <Icon name="clock" size={22} color={C.muted} />
        </Pressable>
      </View>

      {/* Mode selector */}
      <View style={[styles.modeContainer, { backgroundColor: C.surface, borderColor: C.border }]}>
        {MODES.map((m) => {
          const active = m.key === modeKey;
          return (
            <Pressable
              key={m.key}
              onPress={() => handleModeChange(m.key)}
              style={[
                styles.modeSegment,
                active && { backgroundColor: m.color + "22", borderColor: m.color + "44" },
                !active && { borderColor: "transparent" },
              ]}
            >
              <View style={[styles.modeIconWrap, { backgroundColor: active ? m.color : C.surface2 }]}>
                <Icon name={m.icon} size={14} color={active ? "#FFF" : C.muted} />
              </View>
              <Text
                style={[
                  styles.modeLabel,
                  { color: active ? m.color : C.muted },
                ]}
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Mode description */}
      <Text style={[styles.modeDesc, { color: C.muted }]}>{mode.desc}</Text>

      {/* Subject picker — visible only before timer starts */}
      {!running && elapsed === 0 && (
        <SubjectPicker selected={selectedSubjectKey} onSelect={setSelectedSubjectKey} />
      )}

      <View style={styles.center}>
        <Text style={[TYPOGRAPHY.label, { color: phaseColor, marginBottom: 4 }]}>
          {isPomodoro ? `${phaseLabel.toUpperCase()}  ·  Tur ${cycleIndex + 1}/${mode.cycles}` : ""}
        </Text>
        {topic ? (
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.sec, marginBottom: SPACING.lg }]}>
            {topic}
          </Text>
        ) : (
          <View style={{ marginBottom: SPACING.lg }} />
        )}

        <TimerRing size={240} stroke={10} pct={pct} color={phaseColor} C={C}>
          <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>{fmt(elapsed)}</Text>
          {isPomodoro && (
            <Text style={[TYPOGRAPHY.caption, { color: C.muted, marginTop: 4 }]}>
              {`${Math.floor(phaseTargetSec / 60)} dk`}
            </Text>
          )}
        </TimerRing>

        <View style={styles.controls}>
          {isPomodoro && (
            <Pressable onPress={skipPhase} accessibilityLabel="Fazı Atla" accessibilityRole="button" style={styles.sideBtn}>
              <Icon name="chevR" size={20} color={C.muted} />
            </Pressable>
          )}
          <Pressable
            onPress={hasSubject ? toggle : undefined}
            accessibilityLabel={running ? "Duraklat" : "Başlat"}
            accessibilityRole="button"
            style={[
              styles.mainBtn,
              { backgroundColor: hasSubject ? phaseColor : C.border },
            ]}
          >
            <Icon name={running ? "pause" : "play"} size={28} color={hasSubject ? C.bg : C.muted} />
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
        {questions > 0 && (
          <View style={styles.questionRow}>
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.sec }]}>Doğru sayısı</Text>
            <View style={styles.stepper}>
              <Pressable onPress={removeCC} hitSlop={8} style={styles.stepBtn}>
                <Text style={[TYPOGRAPHY.subheading, { color: C.muted }]}>-</Text>
              </Pressable>
              <Text style={[TYPOGRAPHY.statSmall, { color: C.text, minWidth: 40, textAlign: "center" }]}>
                {correctCount}
              </Text>
              <Pressable onPress={addCC} hitSlop={8} style={styles.stepBtn}>
                <Text style={[TYPOGRAPHY.subheading, { color: C.green }]}>+</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <Pressable onPress={finish} style={styles.finishBtn}>
        <Icon name="check" size={20} color={C.bg} />
        <Text style={[TYPOGRAPHY.button, { color: C.bg }]}>Bitir</Text>
      </Pressable>
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
    modeContainer: {
      flexDirection: "row",
      marginHorizontal: SPACING.lg,
      marginVertical: SPACING.sm,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      padding: 4,
      gap: 4,
    },
    modeSegment: {
      flex: 1,
      alignItems: "center",
      gap: 4,
      paddingVertical: 10,
      borderRadius: RADIUS.lg,
      borderWidth: 1.5,
    },
    modeIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    modeLabel: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 11,
      letterSpacing: 0.2,
    },
    modeDesc: {
      ...TYPOGRAPHY.caption,
      textAlign: "center",
      marginTop: 8,
      marginBottom: 4,
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
      backgroundColor: C.accent, borderRadius: RADIUS.xl,
      marginHorizontal: SPACING.lg, marginBottom: SPACING.xxl, paddingVertical: SPACING.lg,
      ...SHADOWS.accent,
    },
  });
}
