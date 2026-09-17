import { useMemo } from "react";

import { useCurriculum } from "./useCurriculum";
import { useDerslerProgress } from "./useDerslerProgress";

// YOL HARITASI — "MÜFREDAT İLERLEMESİ 61/129 konu".
// Mufredat (useCurriculum) + konu ilerlemesi (topic_progress, useDerslerProgress).
// Bir konu, ilerleme puani 100'e ulastiginda "bitti" sayilir — Program Hub'in
// eski "Tüm Dersler" bolumuyle ayni olcu, yeni bir esik uydurulmadi.
export function useCurriculumMap() {
  const { tytSubjects, aytSubjects, loading, group1Label, group2Label } = useCurriculum();
  const all = useMemo(() => [...tytSubjects, ...aytSubjects], [tytSubjects, aytSubjects]);
  const { dersler, totalDone, totalAll, refresh } = useDerslerProgress(all);

  const groups = useMemo(() => {
    const byKey = new Map(dersler.map((d) => [d.key, d]));
    const build = (label, list) => {
      const items = list.map((s) => byKey.get(s.key)).filter((d) => d && d.total > 0);
      return {
        key: label,
        label: label.toLocaleUpperCase("tr-TR"),
        countLabel: `${items.length} ders`,
        done: items.reduce((n, d) => n + d.done, 0),
        total: items.reduce((n, d) => n + d.total, 0),
        items,
      };
    };
    return [build(group1Label, tytSubjects), build(group2Label, aytSubjects)].filter((g) => g.items.length);
  }, [dersler, tytSubjects, aytSubjects, group1Label, group2Label]);

  return {
    loading,
    groups,
    done: totalDone,
    total: totalAll,
    left: Math.max(0, totalAll - totalDone),
    pct: totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0,
    refresh,
  };
}
