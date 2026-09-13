import { TrialEntryHeader } from "./TrialEntryHeader";
import { TrialEntryStep1 } from "./TrialEntryStep1";
import { TrialEntryStep2 } from "./TrialEntryStep2";
import { TrialEntryStep3 } from "./TrialEntryStep3";

// Deneme Gir sihirbazi: 1/3 deneme turu+yayin, 2/3 net dokumu, 3/3 son kontrol.
// Adim gecisleri disaridan gelir (useTrialEntrySteps ekran seviyesinde yasar).
export function TrialEntryFormContent({ form, styles, step, totalSteps, goNext, goBack, overflow }) {
  return (
    <>
      <TrialEntryHeader step={step} totalSteps={totalSteps} onBack={goBack} showCount={step < totalSteps} />
      {step === 1 ? <TrialEntryStep1 form={form} styles={styles} onNext={goNext} /> : null}
      {step === 2 ? <TrialEntryStep2 form={form} styles={styles} overflow={overflow} onNext={goNext} /> : null}
      {step === 3 ? <TrialEntryStep3 form={form} styles={styles} onBack={goBack} /> : null}
    </>
  );
}
