import { useEffect } from "react";

import { useExam } from "../contexts/ExamContext";
import { depthToneFor, setDepthTone } from "../lib/depthTone";

// Ana sayfanin ust isiginin tonu gunun durumunu tasir (ScreenDepth):
// hedef tuttu -> hafif yesil, sinav 30 gun icinde -> hafif sicak.
export function useHomeDepthTone(solvedToday, dailyGoal) {
  const { daysUntilExam } = useExam();
  useEffect(() => {
    setDepthTone(depthToneFor({ solvedToday, dailyGoal, daysUntilExam }));
  }, [solvedToday, dailyGoal, daysUntilExam]);
}
