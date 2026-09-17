import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";

import { TYPOGRAPHY, STEP } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { formatTimerDuration } from "../../domain/study/studyTimerModel";
import { SubjectPicker } from "./components/SubjectPicker";
import { StudyTimerControls } from "./components/StudyTimerControls";
import { StudyTimerHeader } from "./components/StudyTimerHeader";
import { StudyTimerModeSelector } from "./components/StudyTimerModeSelector";
import { StudyTimerNotice } from "./components/StudyTimerNotice";
import { StudyTimerQuestionCounters } from "./components/StudyTimerQuestionCounters";
import { SubjectTopicCard } from "./components/SubjectTopicCard";
import { TimerRing } from "./components/TimerRing";
import { useStudyTimerController } from "./useStudyTimerController";
import { RecoveredSessionView } from "./components/record/RecoveredSessionView";

export default function StudyTimerScreen() {
  const C = useC();
  const timer = useStudyTimerController(C);

  // YARIM KALAN OTURUM KURTARMA ("Oturum Kurtarıldı").
  // Uygulama arka planda öldürüldüyse (iOS'ta rutin) oturum diskten geri
  // gelir; süre onaylanır ya da düzeltilir, sonra kayıt ekranına geçilir.
  if (timer.recovery) {
    return (
      <RecoveredSessionView
        session={timer.recovery}
        onConfirm={timer.confirmRecovered}
        onDiscard={timer.discardRecovered}
      />
    );
  }

  const {
    addCorrect, addQuestion, correctCount, cycleIndex, elapsed, exit, finish,
    handleModeChange, hasSubject, isPomodoro, mode, modeKey, modes, openHistory,
    pct, phaseColor, questions, removeCorrect, removeQuestion, running,
    selectedSubjectKey, setSelectedSubjectKey, skipPhase, stopLabel, subject,
    toggle, topic,
  } = timer;

  const eyebrow = isPomodoro
    ? `ODAK · ${cycleIndex + 1}. SEANS`
    : hasSubject
      ? "SERBEST ÇALIŞMA"
      : "ODAK";

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <StudyTimerHeader
        C={C}
        eyebrow={eyebrow}
        eyebrowColor={isPomodoro ? phaseColor : C.text3}
        onBack={exit}
        onHistory={openHistory}
      />

      <StudyTimerModeSelector C={C} modeKey={modeKey} modes={modes} onChange={handleModeChange} />

      {!running && elapsed === 0 && !hasSubject && (
        <SubjectPicker selected={selectedSubjectKey} onSelect={setSelectedSubjectKey} />
      )}

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: STEP.s4 }}>
        <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: "center" }}>
          <TimerRing
            size={272}
            stroke={8}
            pct={pct}
            color={phaseColor}
            cycleIndex={cycleIndex}
            totalCycles={mode?.cycles || 4}
            showDashes={isPomodoro}
            C={C}
          >
            <Text
              style={[
                TYPOGRAPHY.heroNumber,
                { fontSize: 62, lineHeight: 66, letterSpacing: -1.8, color: C.text },
              ]}
              allowFontScaling={false}
            >
              {formatTimerDuration(timer.displaySeconds ?? elapsed)}
            </Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: 10 }]}>
              {isPomodoro
                ? `${mode?.focus || 25} dk odak · ${mode?.break || 5} dk mola`
                : (hasSubject ? "serbest çalışma" : "ders seçilmedi")}
            </Text>
          </TimerRing>
        </Animated.View>

        {hasSubject && (
          <>
            <SubjectTopicCard C={C} subject={subject} topic={topic} stopLabel={stopLabel} />

            <StudyTimerNotice C={C} />
          </>
        )}

        {!isPomodoro && (
          <StudyTimerQuestionCounters
            C={C}
            correctCount={correctCount}
            questions={questions}
            onAddCorrect={addCorrect}
            onAddQuestion={addQuestion}
            onRemoveCorrect={removeCorrect}
            onRemoveQuestion={removeQuestion}
          />
        )}

        <StudyTimerControls
          C={C}
          hasSubject={hasSubject}
          isPomodoro={isPomodoro}
          running={running}
          onFinish={finish}
          onSkip={skipPhase}
          onToggle={toggle}
        />
      </View>
    </SafeAreaView>
  );
}
