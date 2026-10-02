import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { selectTrials } from "../store/slices/trialSlice";
import { getAllSubjects, getLGSSubjects, getYDTSubjects } from "../domain/trial/trialTypes";
import { analysisCoachLine } from "../domain/analysis/coachLine";
import { useUserTasks } from "./useUserTasks";
import * as H from "../lib/haptics";
import * as appStorage from "../lib/storage/appStorage";

// Kapatilan yorum metni saklanir: ayni yorum bir daha gelmez, veri degisip
// yeni bir yorum olusursa gorunur.
const DISMISS_KEY = "@maraton:analysis_coach_dismissed";

const LABELS = Object.fromEntries(
  [...getAllSubjects(), ...getLGSSubjects(), ...getYDTSubjects()].map((s) => [s.key, s.name]),
);

// Analiz'in tek koc cumlesi + tek aksiyonu. Aksiyon bugune gercek bir
// durak ekler; eklenince "ne yaptik" cumlesi gorunur.
export function useAnalysisCoach() {
  const trials = useSelector(selectTrials);
  const { createTask } = useUserTasks();
  const [added, setAdded] = useState(false);
  const [dismissed, setDismissed] = useState(null);
  useEffect(() => {
    appStorage.getString(DISMISS_KEY).then((v) => setDismissed(v || "")).catch(() => setDismissed(""));
  }, []);
  const computed = useMemo(() => analysisCoachLine(trials, (k) => LABELS[k] || k), [trials]);
  // Okuma bitmeden gostermiyoruz: kapatilmis yorum acilista bir an gorunup kaybolmasin.
  const line = dismissed === null || (computed && computed.text === dismissed) ? null : computed;

  const dismiss = useCallback(() => {
    if (!computed) return;
    H.select();
    setDismissed(computed.text);
    appStorage.setString(DISMISS_KEY, computed.text).catch(() => {});
  }, [computed]);

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

  return { line, added, act, dismiss };
}
