export const STUDY_TIMER_PHASE = {
  FOCUS: "FOCUS",
  BREAK: "BREAK",
  LONG_BREAK: "LONG_BREAK",
};

export function buildStudyTimerModes(C) {
  return [
    { key: "POMODORO_15", label: "15", rest: "3 DK", icon: "timer", desc: "15 dk odak · 3 dk mola", color: C.accent, focus: 15, break: 3, longBreak: 10, cycles: 4 },
    { key: "POMODORO_25", label: "25", rest: "5 DK", icon: "timer", desc: "25 dk odak · 5 dk mola", color: C.accent, focus: 25, break: 5, longBreak: 15, cycles: 4 },
    { key: "POMODORO_50", label: "50", rest: "10 DK", icon: "timer", desc: "50 dk odak · 10 dk mola", color: C.accent, focus: 50, break: 10, longBreak: 20, cycles: 4 },
    { key: "POMODORO_90", label: "90", rest: "20 DK", icon: "timer", desc: "90 dk odak · 20 dk mola", color: C.accent, focus: 90, break: 20, longBreak: 30, cycles: 2 },
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
  if (!mode || modeKey === "FREE") return 25 * 60;
  if (phase === STUDY_TIMER_PHASE.FOCUS) return (mode.focus || 25) * 60;
  if (phase === STUDY_TIMER_PHASE.BREAK) return (mode.break || 5) * 60;
  return (mode.longBreak || 15) * 60;
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
