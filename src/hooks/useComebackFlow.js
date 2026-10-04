import { useCallback, useEffect, useState } from "react";

/**
 * Geri donus akisinin asamasi (AKIS 14).
 *
 * comeback useRetention'dan gelir (daysAway >= COMEBACK_MIN_DAYS_AWAY, oturum basina bir kez).
 * "Donus duragi" icin ayri bir kayit yok; bu yuzden "done" asamasi yalniz
 * GERCEK veriye dayanir: kullanici donusu baslattiktan sonra bugunun
 * soru ya da dakika toplami baslangic anindakinin ustune cikti.
 * Baslatip calismadan donen kullaniciya istem tekrar gosterilmez.
 */
export function useComebackFlow({ comeback, solvedToday = 0, minutesToday = 0 }) {
  const [baseline, setBaseline] = useState(null);

  useEffect(() => {
    if (!comeback) setBaseline(null);
  }, [comeback]);

  const start = useCallback(() => {
    setBaseline({ solved: solvedToday, minutes: minutesToday });
  }, [minutesToday, solvedToday]);

  const progressed = Boolean(
    baseline && (solvedToday > baseline.solved || minutesToday > baseline.minutes),
  );

  let stage = null;
  // Odak kosulu burada degil: "prompt" hero'nun icinde (ekran gizliyken
  // gorunmez), "done" modali HomeComebackOverlay odakta degilken cizmez.
  if (comeback) {
    if (!baseline) stage = "prompt";
    else if (progressed) stage = "done";
  }

  return { stage, start };
}
