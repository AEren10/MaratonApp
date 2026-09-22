import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";

import { STEP } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SubjectPicker } from "./components/SubjectPicker";
import { StudyTimerControls } from "./components/StudyTimerControls";
import { StudyTimerHeader } from "./components/StudyTimerHeader";
import { StudyTimerModeSelector } from "./components/StudyTimerModeSelector";
import { StudyTimerNotice } from "./components/StudyTimerNotice";
import { StudyTimerQuestionCounters } from "./components/StudyTimerQuestionCounters";
import { SubjectTopicCard } from "./components/SubjectTopicCard";
import { TimerCenterDisplay } from "./components/TimerCenterDisplay";
import { TimerRing } from "./components/TimerRing";
import { useStudyTimerController } from "./useStudyTimerController";
import { RecoveredSessionView } from "./components/record/RecoveredSessionView";

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

export default function StudyTimerScreen() {
  const C = useC();
  const timer = useStudyTimerController(C);
  const focusProgress = useSharedValue(0);

  const {
    addCorrect, addQuestion, correctCount, cycleIndex, elapsed, exit, finish,
    handleModeChange, hasSubject, isPomodoro, mode, modeKey, modes, openHistory,
    pct, phaseColor, questions, removeCorrect, removeQuestion, running,
    selectedSubjectKey, setSelectedSubjectKey, skipPhase, stopLabel, subject,
    toggle, topic,
  } = timer;

  useEffect(() => {
    focusProgress.value = withTiming(running ? 1 : 0, { duration: 320, easing: EASE_OUT });
  }, [running, focusProgress]);

  const timerAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(focusProgress.value, [0, 1], [1.0, 1.22]) },
      { translateY: interpolate(focusProgress.value, [0, 1], [0, 36]) },
    ],
  }));

  const topAnimStyle = useAnimatedStyle(() => ({
    opacity: 1 - focusProgress.value,
    transform: [{ translateY: interpolate(focusProgress.value, [0, 1], [0, -18]) }],
  }));

  const bottomCardsAnimStyle = useAnimatedStyle(() => ({
    opacity: 1 - focusProgress.value,
    transform: [{ translateY: interpolate(focusProgress.value, [0, 1], [0, 22]) }],
  }));

  if (timer.recovery) {
    return (
      <RecoveredSessionView
        session={timer.recovery}
        onConfirm={timer.confirmRecovered}
        onDiscard={timer.discardRecovered}
      />
    );
  }

  const eyebrow = isPomodoro ? `ODAK · ${cycleIndex + 1}. SEANS`
    : hasSubject ? (subject.label || "SERBEST ÇALIŞMA").toUpperCase() : "ODAK";

  const topicSubtitle = topic && topic.toLowerCase() !== (subject?.label || "").toLowerCase()
    ? topic : "Genel çalışma";

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <StudyTimerHeader C={C} eyebrow={eyebrow} eyebrowColor={isPomodoro ? phaseColor : C.text2} onBack={exit} onHistory={openHistory} />

      <Animated.View style={topAnimStyle} pointerEvents={running ? "none" : "auto"}>
        <StudyTimerModeSelector C={C} modeKey={modeKey} modes={modes} onChange={handleModeChange} />
      </Animated.View>

      {!hasSubject && elapsed === 0 && (
        <SubjectPicker selected={selectedSubjectKey} onSelect={setSelectedSubjectKey} />
      )}

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: STEP.s4 }}>
        <Animated.View style={[{ alignItems: "center" }, timerAnimStyle]}>
          <TimerRing size={272} stroke={8} pct={pct} color={phaseColor} cycleIndex={cycleIndex} totalCycles={mode?.cycles || 4} showDashes={isPomodoro} C={C}>
            <TimerCenterDisplay C={C} displaySeconds={timer.displaySeconds} elapsed={elapsed} hasSubject={hasSubject} isPomodoro={isPomodoro} mode={mode} running={running} subject={subject} topicSubtitle={topicSubtitle} />
          </TimerRing>
        </Animated.View>

        <Animated.View style={[{ width: "100%" }, bottomCardsAnimStyle]} pointerEvents={running ? "none" : "auto"}>
          {hasSubject && (
            <>
              <SubjectTopicCard C={C} subject={subject} topic={topic} stopLabel={stopLabel} />
              <StudyTimerNotice C={C} />
            </>
          )}

          {!isPomodoro && (
            <StudyTimerQuestionCounters C={C} correctCount={correctCount} questions={questions} onAddCorrect={addCorrect} onAddQuestion={addQuestion} onRemoveCorrect={removeCorrect} onRemoveQuestion={removeQuestion} />
          )}
        </Animated.View>

        <StudyTimerControls C={C} hasSubject={hasSubject} isPomodoro={isPomodoro} running={running} onFinish={finish} onSkip={skipPhase} onToggle={toggle} />
      </View>
    </SafeAreaView>
  );
}
