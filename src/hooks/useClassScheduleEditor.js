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
  const { subjects, tytSubjects, aytSubjects, group1Label, group2Label } = useCurriculum();
  const [draft, setDraft] = useState(schedule);
  const [open, setOpen] = useState(null);

  useEffect(() => { setDraft(schedule); }, [schedule]);

  const mapSubjectList = (list) => {
    const seen = new Map();
    (list || []).forEach((sub) => {
      const pKey = subjectPaletteKey(sub.key);
      const key = sub.key || pKey;
      if (key && !seen.has(key)) {
        seen.set(key, { key, label: sub.label || sub.name || key, paletteKey: pKey });
      }
    });
    return [...seen.values()];
  };

  const tytOptions = useMemo(() => mapSubjectList(tytSubjects), [tytSubjects]);
  const aytOptions = useMemo(() => mapSubjectList(aytSubjects), [aytSubjects]);

  const options = useMemo(() => {
    if (tytOptions.length === 0 && aytOptions.length === 0) {
      return mapSubjectList(subjects);
    }
    const combined = [...tytOptions];
    aytOptions.forEach((o) => {
      if (!combined.some((existing) => existing.key === o.key)) {
        combined.push(o);
      }
    });
    return combined;
  }, [tytOptions, aytOptions, subjects]);

  const labelOf = useCallback(
    (key) => {
      const match = options.find((o) => o.key === key || o.paletteKey === key);
      return match?.label || key;
    },
    [options],
  );

  const displayLabelOf = useCallback(
    (key) => {
      const match = options.find((o) => o.key === key);
      if (match) {
        if (key.startsWith("ayt_") && !match.label.startsWith("AYT ")) {
          return `AYT ${match.label}`;
        }
        return match.label;
      }
      const pMatch = options.find((o) => o.paletteKey === key);
      if (pMatch) {
        if (key.startsWith("ayt_") && !pMatch.label.startsWith("AYT ")) {
          return `AYT ${pMatch.label}`;
        }
        return pMatch.label;
      }
      return key;
    },
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
    tytOptions,
    aytOptions,
    group1Label,
    group2Label,
    labelOf,
    displayLabelOf,
    open,
    toggleOpen: (weekday) => setOpen((cur) => (cur === weekday ? null : weekday)),
    toggleSubject,
    setHours,
    toggleKind,
    totalHours: weeklyHours(draft),
    submit: () => save(draft),
  };
}
