import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";

import { Card } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { formatTimerDuration } from "../../domain/study/studyTimerModel";
import { SubjectPicker } from "./components/SubjectPicker";
import { StudyTimerControls } from "./components/StudyTimerControls";
import { StudyTimerHeader } from "./components/StudyTimerHeader";
import { StudyTimerModeSelector } from "./components/StudyTimerModeSelector";
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
    stopLabel,
    subject,
    toggle,
    topic,
  } = timer;

  const eyebrow = isPomodoro
    ? `${phaseLabel.toUpperCase()} · TUR ${cycleIndex + 1}/${mode.cycles}`
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

      {!running && elapsed === 0 && (
        <SubjectPicker selected={selectedSubjectKey} onSelect={setSelectedSubjectKey} />
      )}

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: STEP.s4 }}>
        <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: "center" }}>
          <TimerRing size={240} stroke={10} pct={pct} color={phaseColor} C={C}>
            <Text style={[TYPOGRAPHY.statLarge, { color: C.text }]} allowFontScaling={false}>
              {formatTimerDuration(elapsed)}
            </Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s1 }]}>
              {isPomodoro
                ? `${Math.floor(phaseTargetSec / 60)} dk ${phaseLabel.includes("Mola") ? "mola" : "odak"}`
                : hasSubject ? "serbest çalışma" : "ders seçilmedi"}
            </Text>
          </TimerRing>
        </Animated.View>

        {hasSubject && (
          <>
            <SubjectTopicCard C={C} subject={subject} topic={topic} stopLabel={stopLabel} />

            <View style={{ width: "100%", paddingHorizontal: GUTTER, marginTop: STEP.s2 }}>
              <Card tone="void">
                <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>
                  Çözdüğün soruyu bitişte soracağız. Şimdi sadece çalış.
                </Text>
              </Card>
            </View>
          </>
        )}

        <StudyTimerQuestionCounters
          C={C}
          correctCount={correctCount}
          questions={questions}
          onAddCorrect={addCorrect}
          onAddQuestion={addQuestion}
          onRemoveCorrect={removeCorrect}
          onRemoveQuestion={removeQuestion}
        />

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
