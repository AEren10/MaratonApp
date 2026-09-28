import { useMemo } from "react";

import { useExam } from "../contexts/ExamContext";
import { forecastTarget } from "../domain/forecast/forecastTarget";

// Tahminle kiyaslanacak hedef: tahminin sinavina (TYT / AYT) ait olan.
// forecastTypes useStudyRoute'tan gelir; hook ayri cagrilmasin diye parametre.
export function useForecastTarget(forecastTypes) {
  const { examType, targetNet, targetNetTYT, targetNetAYT } = useExam();
  return useMemo(
    () => forecastTarget({ types: forecastTypes || [], examType, targetNet, targetNetTYT, targetNetAYT }),
    [forecastTypes, examType, targetNet, targetNetTYT, targetNetAYT],
  );
}
