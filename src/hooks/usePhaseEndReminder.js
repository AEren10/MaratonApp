import { useEffect } from "react";

import { cancelTimerPhaseEnd, scheduleTimerPhaseEnd } from "../lib/timerNotifications";
import { phaseEndDelaySec } from "../domain/study/phaseEndReminder";

// Sayac calisirken (pomodoro) faz bitisine bir yerel bildirim kurar; duraklatma,
// faz degisimi ya da ekrandan cikista iptal eder. Sureyi her kurulumda saat
// referansindan okur (getElapsedSec), bu yuzden devam edince dogru kalir.
export function usePhaseEndReminder({ enabled, phase, targetSec, getElapsedSec }) {
  useEffect(() => {
    if (!enabled) return undefined;
    const delay = phaseEndDelaySec(targetSec, getElapsedSec());
    if (delay > 0) scheduleTimerPhaseEnd(delay, phase);
    return () => { cancelTimerPhaseEnd(); };
  }, [enabled, phase, targetSec, getElapsedSec]);
}
