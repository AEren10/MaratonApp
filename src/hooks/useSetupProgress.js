import { useMemo } from "react";
import { useExam } from "../contexts/ExamContext";
import { SCREENS } from "../constants/screens";

// Tasarim AKIS 12'nin dort adimi (bkz constants/screens.js yorumu):
// Sinav secimi -> Hedef net -> Baslangic noktasi -> Rotan.
//
// DOGRULANMADI: "Baslangic noktasi" (LevelTest) ve "Rotan" (RouteReady)
// icin ExamContext'te henuz bir tamamlanma bayragi yok — bu iki ekran
// baska bir ajan tarafindan simdi yaziliyor. Su an itibariyle onboardingDone
// examType + dailyGoalSet ikilisiyle true olduguna gore, canli akiste bu
// ekran pratikte yalnizca ilk iki adimdan birini eksik gosterebilir.
// LevelTest/RouteReady tamamlanma durumu netlesince buraya eklenmeli.
const STEPS = [
  {
    key: "exam",
    label: "Sınav seçimi",
    screen: SCREENS.EXAM_SETUP,
    isDone: (ctx) => !!ctx.examType,
    summary: (ctx) => {
      if (!ctx.examType) return null;
      return ctx.field ? `${ctx.examType} · ${ctx.field}` : ctx.examType;
    },
  },
  {
    key: "goal",
    label: "Hedef net",
    screen: SCREENS.GOAL_SETUP,
    isDone: (ctx) => !!ctx.dailyGoalSet,
  },
  {
    key: "levelTest",
    label: "Başlangıç noktası",
    screen: SCREENS.LEVEL_TEST,
    // DOGRULANMADI: gercek tamamlanma bayragi yok, onboardingDone'a dayanir.
    isDone: (ctx) => !!ctx.onboardingDone,
  },
  {
    key: "route",
    label: "Rotan",
    screen: SCREENS.ROUTE_READY,
    // DOGRULANMADI: gercek tamamlanma bayragi yok, onboardingDone'a dayanir.
    isDone: (ctx) => !!ctx.onboardingDone,
  },
];

export function useSetupProgress() {
  const ctx = useExam();

  return useMemo(() => {
    const steps = STEPS.map((s) => ({
      key: s.key,
      label: s.label,
      screen: s.screen,
      done: s.isDone(ctx),
      summary: s.summary ? s.summary(ctx) : null,
    }));
    const doneCount = steps.filter((s) => s.done).length;
    const nextStep = steps.find((s) => !s.done) || null;

    return {
      steps,
      doneCount,
      totalSteps: steps.length,
      nextStep,
      isComplete: !nextStep,
      loading: ctx.loading,
    };
  }, [ctx]);
}
