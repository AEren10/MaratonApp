import { memo } from "react";
import { ComebackPrompt } from "./comeback/ComebackPrompt";
import { ComebackDone } from "./comeback/ComebackDone";

// AKIS 14 geri donus anlari. Asama useComebackFlow'dan gelir:
//   "prompt" — uzun aradan sonra ilk acilis (Geri Donus)
//   "done"   — donus baslatildiktan sonra bugun gercek calisma kaydi olustu (Geri Dondun)
export const ComebackModal = memo(function ComebackModal({
  stage = null,
  pendingStops = 0,
  solvedToday = 0,
  minutesToday = 0,
  stopsClosedToday = 0,
  routeProgress = null,
  onStart,
  onPickStop,
  onNext,
  onClose,
}) {
  if (stage === "prompt") {
    return (
      <ComebackPrompt
        pendingStops={pendingStops}
        onStart={onStart}
        onPickStop={onPickStop}
        onClose={onClose}
      />
    );
  }
  if (stage === "done") {
    return (
      <ComebackDone
        minutesToday={minutesToday}
        solvedToday={solvedToday}
        stopsClosedToday={stopsClosedToday}
        routeProgress={routeProgress}
        onNext={onNext}
        onClose={onClose}
      />
    );
  }
  return null;
});
