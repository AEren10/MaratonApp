import { useCallback, useEffect, useMemo, useState } from "react";

import { useClassSchedule } from "./useClassSchedule";
import { useCurriculum } from "./useCurriculum";
import { DAY_KINDS, normalizeSchedule, weeklyHours } from "../domain/program/classSchedule";
import { subjectPaletteKey } from "../themes/subjectPalette";

// Ders Programi ekraninin taslak durumu: satira dokununca o gun acilir,
// ders/sure/gun turu degisir; kaydetme useClassSchedule uzerinden.
// Dersler palet anahtariyla tutulur (TYT ve AYT Matematik tek "matematik").
export function useClassScheduleEditor() {
  const { schedule, loading, saving, save } = useClassSchedule();
  const { subjects } = useCurriculum();
  const [draft, setDraft] = useState(schedule);
  const [open, setOpen] = useState(null);

  useEffect(() => { setDraft(schedule); }, [schedule]);

  const options = useMemo(() => {
    const seen = new Map();
    (subjects || []).forEach((sub) => {
      const key = subjectPaletteKey(sub.key);
      if (key && !seen.has(key)) seen.set(key, { key, label: sub.label || sub.name || key });
    });
    return [...seen.values()];
  }, [subjects]);

  const labelOf = useCallback(
    (key) => options.find((o) => o.key === subjectPaletteKey(key))?.label || key,
    [options],
  );

  const patchDay = useCallback((weekday, fn) => {
    setDraft((prev) => normalizeSchedule(prev.map((d) => (d.weekday === weekday ? fn(d) : d))));
  }, []);

  const toggleSubject = useCallback((weekday, key) => patchDay(weekday, (d) => ({
    ...d,
    kind: DAY_KINDS.STUDY,
    subjects: d.subjects.includes(key) ? d.subjects.filter((k) => k !== key) : [...d.subjects, key],
  })), [patchDay]);

  const setHours = useCallback((weekday, hours) => patchDay(weekday, (d) => ({
    ...d,
    kind: d.kind === DAY_KINDS.OFF ? DAY_KINDS.STUDY : d.kind,
    minutes: hours * 60,
  })), [patchDay]);

  const toggleKind = useCallback((weekday, kind) => patchDay(weekday, (d) => ({
    ...d,
    kind: d.kind === kind ? DAY_KINDS.STUDY : kind,
    subjects: [],
  })), [patchDay]);

  return {
    loading,
    saving,
    draft,
    options,
    labelOf,
    open,
    toggleOpen: (weekday) => setOpen((cur) => (cur === weekday ? null : weekday)),
    toggleSubject,
    setHours,
    toggleKind,
    totalHours: weeklyHours(draft),
    submit: () => save(draft),
  };
}
