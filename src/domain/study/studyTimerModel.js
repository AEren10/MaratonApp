export const STUDY_TIMER_PHASE = {
  FOCUS: "FOCUS",
  BREAK: "BREAK",
  LONG_BREAK: "LONG_BREAK",
};

export function buildStudyTimerModes(C) {
  return [
    { key: "FREE", label: "Serbest", icon: "zap", desc: "Süresiz — istediğin zaman bitir", color: C.text, focus: 0, break: 0, longBreak: 0, cycles: 0 },
    { key: "POMODORO_25", label: "25/5", icon: "timer", desc: "25 dk odak + 5 dk mola × 4 tur", color: C.amber, focus: 25, break: 5, longBreak: 15, cycles: 4 },
    { key: "POMODORO_50", label: "50/10", icon: "timer", desc: "50 dk odak + 10 dk mola × 3 tur", color: C.blue, focus: 50, break: 10, longBreak: 20, cycles: 3 },
    { key: "DEEP_90", label: "90 dk", icon: "timer", desc: "Sınav modu — 90dk kesintisiz", color: C.purple, focus: 90, break: 20, longBreak: 30, cycles: 2 },
  ];
}

export function formatTimerDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function getPhaseTargetSeconds({ mode, modeKey, phase }) {
  if (modeKey === "FREE") return 25 * 60;
  if (phase === STUDY_TIMER_PHASE.FOCUS) return mode.focus * 60;
  if (phase === STUDY_TIMER_PHASE.BREAK) return mode.break * 60;
  return mode.longBreak * 60;
}

export function getPhaseLabel({ cycleIndex, mode, phase }) {
  if (phase === STUDY_TIMER_PHASE.FOCUS) return `Odak ${cycleIndex + 1}/${mode.cycles || 1}`;
  if (phase === STUDY_TIMER_PHASE.BREAK) return "Kısa Mola";
  return "Uzun Mola";
}

export function getFocusSecondsForSave({ elapsed, isPomodoro, phase, totalFocusSeconds }) {
  if (!isPomodoro) return elapsed;
  return totalFocusSeconds + (phase === STUDY_TIMER_PHASE.FOCUS ? elapsed : 0);
}
