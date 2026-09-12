import { useCallback, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { getJson, setJson } from "../lib/storage/appStorage";
import { todayTR } from "../lib/dateUtils";
import {
  summarizeWeekCompletion,
  isRouteComplete,
  pickCompletionMoment,
  markCompletionSeen,
} from "../domain/route/completionMoments";

/**
 * Tamamlama anlarinin tetikleyicisi (AKIS 16). Kurallar
 * domain/route/completionMoments.js'te; bu hook yalniz "gorulen" kaydini
 * kullanici bazli anahtarda tutar ve gun anini TodayPlanCard'dan alir.
 */
export function useCompletionMoments({ currentWeek, totals, userId }) {
  const [seen, setSeen] = useState(null);
  const [dayDone, setDayDone] = useState(null);
  const storeKey = userScopedKey(STORAGE_KEYS.COMPLETION_SHOWN, userId);
  const todayKey = todayTR();

  useEffect(() => {
    let alive = true;
    setSeen(null);
    setDayDone(null);
    if (!userId) return undefined;
    getJson(storeKey, {})
      .then((value) => { if (alive) setSeen(value || {}); })
      .catch(() => { if (alive) setSeen({}); });
    return () => { alive = false; };
  }, [storeKey, userId]);

  const week = useMemo(() => summarizeWeekCompletion(currentWeek), [currentWeek]);
  const routeComplete = isRouteComplete(totals);
  const day = dayDone?.date === todayKey ? dayDone : null;
  const dayKey = day ? todayKey : null;

  const moment = pickCompletionMoment({ seen, routeComplete, week, dayKey });

  // TodayPlanCard'in onAllDone'i: maddelerin tamami isaretlendiginde cagrilir.
  const markDayDone = useCallback((items = []) => {
    const planItems = items.filter((item) => item.source === "plan");
    // Rota/plan gorevleri henuz yuklenmeden yalniz kullanici gorevleri
    // bitmis gorunebilir; o anda "gun kapandi" demek erken olur.
    if (!planItems.length) return;
    setDayDone({ date: todayTR(), items });
  }, []);

  const dismiss = useCallback(() => {
    if (!seen) return;
    const next = markCompletionSeen({ seen, routeComplete, week, dayKey });
    setSeen(next);
    setJson(storeKey, next).catch(() => {});
  }, [dayKey, routeComplete, seen, storeKey, week]);

  return { moment, week, day, dismiss, markDayDone };
}
