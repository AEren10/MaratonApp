import { useEffect, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { formatTimerDuration } from "../../domain/study/studyTimerModel";
import { SubjectPicker } from "./components/SubjectPicker";
import { StudyTimerControls } from "./components/StudyTimerControls";
import { StudyTimerHeader } from "./components/StudyTimerHeader";
import { StudyTimerModeSelector } from "./components/StudyTimerModeSelector";
import { StudyTimerQuestionCounters } from "./components/StudyTimerQuestionCounters";
import { TimerRing } from "./components/TimerRing";
import { useStudyTimerController } from "./useStudyTimerController";
import { useAlert } from "../../contexts/AlertContext";

export default function StudyTimerScreen() {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const timer = useStudyTimerController(C);
  const showAlert = useAlert();

  // YARIM KALAN OTURUM KURTARMA.
  // Uygulama arka planda öldürüldüyse (iOS'ta rutin) oturum diskten geri
  // gelir. Önceden sayaç sıfırlanıyor ve emek sessizce yok oluyordu.
  useEffect(() => {
    if (!timer.recovery) return;
    showAlert(
      "Yarım kalan oturumun var",
      `${timer.recoveryLabel} bir çalışma kaydedilmemiş. Kaldığın yerden devam etmek ister misin?`,
      [
        { text: "Sil", style: "destructive", onPress: timer.discardRecovered },
        { text: "Devam et", onPress: timer.resumeRecovered },
      ],
    );
  }, [timer.recovery]);

  const {
    addCorrect,
    addQuestion,
    correctCount,
    cycleIndex,
    elapsed,
    exit,
    finish,
    handleModeChange,
    hasSubject,
    isPomodoro,
    mode,
    modeKey,
    modes,
    openHistory,
    pct,
    phaseColor,
    phaseLabel,
    phaseTargetSec,
    questions,
    removeCorrect,
    removeQuestion,
    running,
    selectedSubjectKey,
    setSelectedSubjectKey,
    skipPhase,
    subject,
    toggle,
    topic,
    totalFocusSeconds,
  } = timer;

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <StudyTimerHeader
        C={C}
        hasSubject={hasSubject}
        onBack={exit}
        onHistory={openHistory}
        styles={styles}
        subject={subject}
      />

      <StudyTimerModeSelector
        C={C}
        modeKey={modeKey}
        modes={modes}
        onChange={handleModeChange}
        styles={styles}
      />

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
          <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>{formatTimerDuration(elapsed)}</Text>
          {isPomodoro && (
            <Text style={[TYPOGRAPHY.caption, { color: C.muted, marginTop: 4 }]}>
              {`${Math.floor(phaseTargetSec / 60)} dk`}
            </Text>
          )}
        </TimerRing>

        <StudyTimerControls
          C={C}
          hasSubject={hasSubject}
          isPomodoro={isPomodoro}
          phaseColor={phaseColor}
          running={running}
          styles={styles}
          totalFocusSeconds={totalFocusSeconds}
          onSkip={skipPhase}
          onToggle={toggle}
        />

        <StudyTimerQuestionCounters
          C={C}
          correctCount={correctCount}
          phaseColor={phaseColor}
          questions={questions}
          styles={styles}
          onAddCorrect={addCorrect}
          onAddQuestion={addQuestion}
          onRemoveCorrect={removeCorrect}
          onRemoveQuestion={removeQuestion}
        />
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
