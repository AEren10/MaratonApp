import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { getJson, setJson } from "../lib/storage/appStorage";
import { getClassSchedule, saveClassSchedule } from "../supabase/classSchedule";
import {
  normalizeSchedule, isScheduleDefined, weeklyHours, activeDayCount,
} from "../domain/program/classSchedule";

// Haftalik ders programi. Otorite kurali (AGENTS.md): sunucu otorite; yerel
// kopya cevrimdisi dayaniklilik icin. Kullanicinin AZ ONCE girdigi ve
// sunucuya yazilamamis program `pending` bayragiyla yerel kazanir ve bir
// sonraki acilista yeniden gonderilir. Tablo henuz yoksa yerel kopya calisir.
export function useClassSchedule() {
  const { user } = useAuth();
  const userId = user?.id && user.id !== "dev" ? user.id : null;
  const cacheKey = useMemo(() => userScopedKey(STORAGE_KEYS.CLASS_SCHEDULE, userId), [userId]);
  const [schedule, setSchedule] = useState(() => normalizeSchedule(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = await getJson(cacheKey, null);
      if (cancelled) return;
      if (local?.schedule) setSchedule(normalizeSchedule(local.schedule));
      if (!userId) { setLoading(false); return; }
      try {
        if (local?.pending) {
          await saveClassSchedule(userId, normalizeSchedule(local.schedule));
          await setJson(cacheKey, { schedule: local.schedule, pending: false });
        } else {
          const rows = await getClassSchedule(userId);
          if (!cancelled && rows.length) {
            const next = normalizeSchedule(rows);
            setSchedule(next);
            await setJson(cacheKey, { schedule: next, pending: false });
          }
        }
      } catch {
        // cevrimdisi ya da tablo yok: yerel kopya gecerli kalir
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [cacheKey, userId]);

  const save = useCallback(async (next) => {
    const normalized = normalizeSchedule(next);
    setSchedule(normalized);
    setSaving(true);
    await setJson(cacheKey, { schedule: normalized, pending: Boolean(userId) });
    try {
      if (userId) {
        await saveClassSchedule(userId, normalized);
        await setJson(cacheKey, { schedule: normalized, pending: false });
      }
      return { synced: Boolean(userId) };
    } catch {
      return { synced: false };
    } finally {
      setSaving(false);
    }
  }, [cacheKey, userId]);

  return {
    schedule,
    loading,
    saving,
    save,
    defined: isScheduleDefined(schedule),
    weeklyHours: weeklyHours(schedule),
    activeDays: activeDayCount(schedule),
  };
}
