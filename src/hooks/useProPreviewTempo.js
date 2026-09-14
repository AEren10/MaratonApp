import { useMemo } from "react";

import { useStudyRoute } from "./useStudyRoute";
import { formatNumber } from "../lib/format";

const ORDER = ["current", "more", "less"];

// "Önizleme · Tempo": uc senaryo kullanicinin kendi denemelerinden
// (useStudyRoute.tempoScenarios). Degeri olmayan alan satirdan duser.
export function useProPreviewTempo() {
  const { tempoScenarios, forecast } = useStudyRoute({ persist: false });

  return useMemo(() => {
    const cards = ORDER
      .map((id) => (tempoScenarios || []).find((s) => s?.id === id))
      .filter(Boolean)
      .map((s) => ({
        id: s.id,
        pct: Math.round(Math.abs(s.multiplier - 1) * 100),
        weekly: s.questionsPerWeek > 0 ? `${formatNumber(s.questionsPerWeek)} soru` : null,
        stops: s.stopsPerWeek > 0 ? `${formatNumber(s.stopsPerWeek)} durak` : null,
        band: s.range ? `${formatNumber(s.range.low)}–${formatNumber(s.range.high)}` : null,
      }));
    return { cards, sampleSize: forecast?.sampleSize || 0 };
  }, [forecast?.sampleSize, tempoScenarios]);
}
