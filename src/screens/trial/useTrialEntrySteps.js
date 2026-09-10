import { useCallback, useMemo, useState } from "react";

import { findSubjectOverflow } from "./components/trialEntryValidation";
import * as H from "../../lib/haptics";

const TOTAL_STEPS = 3;

// Adim sihirbazinin gezinme mantigi. Form state'i hala useTrialEntryForm'da
// yasiyor; burada sadece hangi adimin gorunecegi ve ilerleme kosullari var.
export function useTrialEntrySteps({ form, onExit }) {
  const [step, setStep] = useState(1);

  const overflow = useMemo(
    () => findSubjectOverflow(form.subjects, form.values),
    [form.subjects, form.values],
  );

  const canProceedStep2 = !overflow;

  const goNext = useCallback(() => {
    if (step === 2 && !canProceedStep2) return;
    if (step >= TOTAL_STEPS) return;
    H.tap();
    setStep((previous) => previous + 1);
  }, [step, canProceedStep2]);

  const goBack = useCallback(() => {
    if (step === 1) {
      onExit();
      return;
    }
    H.tap();
    setStep((previous) => previous - 1);
  }, [step, onExit]);

  return {
    step,
    totalSteps: TOTAL_STEPS,
    goNext,
    goBack,
    overflow,
    canProceedStep2,
  };
}
