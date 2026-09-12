import { useMemo } from "react";
import { useSelector } from "react-redux";

import { LEVELS } from "../constants/gamification";
import { selectXP, selectLevel } from "../store/slices/gamificationSlice";
import { formatXP, dativeTitle } from "../lib/levelFormat";

// Seviye ekraninin GOSTERIM verisi. XP sunucu otoritesinde; burada hicbir
// sey hesaplanmiyor/yazilmiyor, yalniz getLevelForXP'nin (selectLevel)
// ciktisi metne ceviriliyor.
export function useLevelProgress() {
  const totalXP = useSelector(selectXP);
  const level = useSelector(selectLevel);

  return useMemo(() => {
    const next = level?.next || null;
    const remaining = next ? Math.max(0, next.xp - totalXP) : 0;

    const path = LEVELS.map((l) => ({
      key: String(l.level),
      name: l.title,
      xpLabel: `${formatXP(l.xp)} XP`,
      state:
        l.level === level.level ? "current" : l.level < level.level ? "passed" : "future",
    }));

    return {
      badge: `SEVİYE ${level.level} · ${level.title.toLocaleUpperCase("tr")}`,
      heroXP: formatXP(totalXP),
      // Hedef esik SONRAKI seviyenin esigi — "kaldi" satiriyla ayni sayiya
      // dayanmasi icin (bkz. rapordaki sapma notu).
      targetLabel: next ? `/ ${formatXP(next.xp)} XP` : "en yüksek seviye",
      remainingLabel: next
        ? `${dativeTitle(next.title)} ${formatXP(remaining)} XP kaldı`
        : null,
      progress: level.progress ?? 1,
      path,
    };
  }, [totalXP, level]);
}
