import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext";
import { useExam } from "../contexts/ExamContext";
import { selectTrials } from "../store/slices/trialSlice";
import { examResultFields, formatNetInput, validateExamResult } from "../domain/exam/examResult";
import { examForecastSnapshot } from "../domain/exam/examForecastSnapshot";
import { buildExamRecap } from "../domain/exam/examRecap";
import { saveExamResult } from "../lib/examResultRepository";
import { SCREENS } from "../constants/screens";
import { useExamResultEntry } from "./useExamResultEntry";
import * as H from "../lib/haptics";

// "Sınav Sonucu" ekraninin tek veri kaynagi. Tahmin anlik goruntusu ILK
// kayitta dondurulur; sonucu duzeltmek gecmis tahmini yeniden yazmaz.
export function useExamResult() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { examType, field, examDate } = useExam();
  const trials = useSelector(selectTrials);
  const { status, entry, examKey, retry } = useExamResultEntry();

  const fields = useMemo(() => examResultFields(examType, field), [examType, field]);
  const [values, setValues] = useState({});
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    if (touched || !entry?.record) return;
    const next = {};
    for (const f of fields) next[f.key] = formatNetInput(entry.record[f.key]);
    setValues(next);
  }, [entry, fields, touched]);

  const setValue = useCallback((key, text) => {
    setTouched(true);
    setValues((v) => ({ ...v, [key]: text.replace(/[^\d.,]/g, "").slice(0, 6) }));
  }, []);

  const validation = useMemo(() => validateExamResult(fields, values), [fields, values]);

  const save = useCallback(async () => {
    if (!validation.savable || !examKey || !user?.id) return;
    setSaving(true);
    setSaveFailed(false);
    try {
      const forecast = entry?.forecast ?? examForecastSnapshot({ trials, examDate, examType });
      await saveExamResult(user.id, { examType, examDate: examKey, record: validation.record, forecast });
      H.success();
      navigation.replace(SCREENS.FORECAST_ACCURACY);
    } catch {
      H.error();
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  }, [validation, examKey, user?.id, entry, trials, examDate, examType, navigation]);

  const days = useMemo(
    () => buildExamRecap({ startedAt: user?.created_at, examDate }).days,
    [user?.created_at, examDate],
  );

  return {
    status,
    retry,
    fields,
    values,
    errors: touched ? validation.errors : {},
    canSave: validation.savable && Boolean(examKey),
    saving,
    saveFailed,
    days,
    setValue,
    save,
    back: navigation.goBack,
  };
}
