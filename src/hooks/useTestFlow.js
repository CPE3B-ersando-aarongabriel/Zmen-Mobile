import { useMemo, useState } from "react";

export function useTestFlow(totalSteps) {
  const [step, setStep] = useState(1);

  const progress = useMemo(() => Math.round((step / totalSteps) * 100), [step, totalSteps]);

  const goNext = () => setStep((prev) => Math.min(totalSteps, prev + 1));
  const goBack = () => setStep((prev) => Math.max(1, prev - 1));
  const reset = () => setStep(1);

  return {
    step,
    progress,
    goNext,
    goBack,
    reset,
    isFirstStep: step === 1,
    isFinalStep: step === totalSteps,
  };
}
