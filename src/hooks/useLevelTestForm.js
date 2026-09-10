import { useCallback, useMemo, useState } from "react";

import { useC } from "../contexts/ThemeContext";
import { useExam } from "../contexts/ExamContext";
import { getTYTSubjects, getLGSSubjects } from "../domain/trial/trialTypes";
import { wrongPenaltyForTrialType } from "../domain/trial/trialModel";
import { track } from "../lib/analytics";
import { EVENTS } from "../constants/analytics";
import * as H from "../lib/haptics";

// Onboarding'in "Seviye Testi" adimi (3/4). Kullanici ders basina dogrudan
// NET yazar; tasarim boyle istiyor. Toplam net rotanin BASLANGIC NOKTASI
// olarak saklanir — deneme kaydi olarak DEGIL, gerekcesi submit'in uzerinde.
export function useLevelTestForm() {
  const C = useC();
  const { examType, targetNet, updateBaselineNet } = useExam();
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  const trialTypeCode = examType === "lgs" ? "LGS" : "TYT";
  const subjects = useMemo(
    () => (examType === "lgs" ? getLGSSubjects(C) : getTYTSubjects(C)),
    [C, examType],
  );
  const wrongPenalty = useMemo(() => wrongPenaltyForTrialType(trialTypeCode), [trialTypeCode]);

  const setSubjectNet = useCallback((key, text) => {
    const clean = text.replace(",", ".").replace(/[^0-9.]/g, "");
    setValues((prev) => ({ ...prev, [key]: clean }));
  }, []);

  const perSubject = useMemo(() => subjects.map((subject) => {
    const raw = parseFloat(values[subject.key]);
    const net = Number.isFinite(raw) ? Math.max(0, Math.min(subject.max, raw)) : null;
    return { subject, net };
  }), [subjects, values]);

  const hasAnyEntry = perSubject.some((row) => row.net != null);

  const totalNet = useMemo(
    () => perSubject.reduce((sum, row) => sum + (row.net || 0), 0),
    [perSubject],
  );

  const gapMonths = useCallback((examDaysLeft) => {
    if (!examDaysLeft) return null;
    return Math.max(1, Math.round(examDaysLeft / 30));
  }, []);

  // BASLANGIC NETI OLARAK SAKLANIR, DENEME KAYDI OLARAK DEGIL.
  //
  // Ilk uygulama bunu deneme kaydi yaziyordu: trial_subjects.net canli DB'de
  // GENERATED ALWAYS (correct_count - wrong_count * wrong_penalty) oldugu icin
  // net dogrudan yazilamiyor ve `correct = round(net), wrong = 0` seklinde
  // ifade ediliyordu. Bu "kullanici hic yanlis yapmadi" iddiasi demek ve uc
  // tuketiciyi yaniltiyor: useAISuggestions (dogruluk orani),
  // useWeeklyTrialReport (haftalik yanlis toplami), trialKeyMap (correct+wrong).
  //
  // Tasarim bu ekranin amacini kendi metninde soyluyor: "rotanin BASLANGIC
  // NOKTASINI oradan cizelim". Ustelik "Bir denemeyle rota cizilir, egilim
  // cizilmez" diyor — tek veri noktasi zaten trend uretmiyor. Dolayisiyla
  // deneme kaydi gerekmiyor; deger kendi alaninda tutuluyor ve uydurma
  // D/Y kirilimi uretilmiyor.
  //
  // Kullanici gercek denemesini D/Y kirilimiyla kaydetmek isterse bunun
  // dogru yeri TrialEntry akisi.
  const submit = useCallback(async (onDone) => {
    if (!hasAnyEntry) { onDone?.(); return; }
    setSaving(true);
    const netVal = Math.round(totalNet * 100) / 100;
    try {
      await updateBaselineNet(netVal);
      track(EVENTS.LEVEL_TEST_SUBMITTED, { net: netVal, trialType: trialTypeCode });
      H.success();
    } catch {
      H.warn();
    } finally {
      setSaving(false);
      onDone?.();
    }
  }, [hasAnyEntry, totalNet, trialTypeCode, updateBaselineNet]);

  return {
    subjects,
    values,
    setSubjectNet,
    perSubject,
    hasAnyEntry,
    totalNet,
    targetNet,
    gapMonths,
    saving,
    submit,
  };
}
