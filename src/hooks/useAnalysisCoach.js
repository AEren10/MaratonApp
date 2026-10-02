import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { selectTrials } from "../store/slices/trialSlice";
import { getAllSubjects, getLGSSubjects, getYDTSubjects } from "../domain/trial/trialTypes";
import { analysisCoachLine } from "../domain/analysis/coachLine";
import { useUserTasks } from "./useUserTasks";
import * as H from "../lib/haptics";

const LABELS = Object.fromEntries(
  [...getAllSubjects(), ...getLGSSubjects(), ...getYDTSubjects()].map((s) => [s.key, s.name]),
);

// Analiz'in tek koc cumlesi + tek aksiyonu. Aksiyon bugune gercek bir
// durak ekler; eklenince "ne yaptik" cumlesi gorunur.
export function useAnalysisCoach() {
  const trials = useSelector(selectTrials);
  const { createTask } = useUserTasks();
  const [added, setAdded] = useState(false);
  const line = useMemo(() => analysisCoachLine(trials, (k) => LABELS[k] || k), [trials]);

  const act = useCallback(async () => {
    if (!line?.action || added) return;
    try {
      await createTask({ subject: line.action.subject, targetMinutes: line.action.minutes });
      H.success();
      setAdded(true);
    } catch {
      H.error();
    }
  }, [added, createTask, line]);

  return { line, added, act };
}
