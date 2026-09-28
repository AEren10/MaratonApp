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
//
// TEK KOPYA: durum modul duzeyinde (kullanici anahtarina gore). Eskiden her
// ekran kendi kopyasini tutuyordu; programi kaydedip geri donunce ana sayfa,
// Program > Hafta ve ŞİMDİ karti eski gun dagilimini gosteriyordu. Ayrica
// `ready` (yerel kopya okundu) gelmeden gunun plani kurulmamali: varsayilan
// "program yok" duraklari 7 gune yayar, liste ziplar.
const stores = new Map();

function storeFor(cacheKey) {
  if (!stores.has(cacheKey)) {
    stores.set(cacheKey, {
      schedule: normalizeSchedule(null), ready: false, loading: true, started: false, listeners: new Set(),
    });
  }
  return stores.get(cacheKey);
}

function emit(store) {
  store.listeners.forEach((fn) => fn({ ...store }));
}

async function loadStore(store, cacheKey, userId) {
  if (store.started) return;
  store.started = true;
  const local = await getJson(cacheKey, null).catch(() => null);
  if (local?.schedule) store.schedule = normalizeSchedule(local.schedule);
  store.ready = true;
  emit(store);
  try {
    if (!userId) return;
    if (local?.pending) {
      await saveClassSchedule(userId, normalizeSchedule(local.schedule));
      await setJson(cacheKey, { schedule: local.schedule, pending: false });
    } else {
      const rows = await getClassSchedule(userId);
      if (rows.length) {
        store.schedule = normalizeSchedule(rows);
        await setJson(cacheKey, { schedule: store.schedule, pending: false });
      }
    }
  } catch {
    // cevrimdisi ya da tablo yok: yerel kopya gecerli kalir
  } finally {
    store.loading = false;
    emit(store);
  }
}

export function useClassSchedule() {
  const { user } = useAuth();
  const userId = user?.id && user.id !== "dev" ? user.id : null;
  const cacheKey = useMemo(() => userScopedKey(STORAGE_KEYS.CLASS_SCHEDULE, userId), [userId]);
  const store = storeFor(cacheKey);
  const [snap, setSnap] = useState(() => ({ ...store }));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = storeFor(cacheKey);
    s.listeners.add(setSnap);
    setSnap({ ...s });
    loadStore(s, cacheKey, userId);
    return () => { s.listeners.delete(setSnap); };
  }, [cacheKey, userId]);

  const save = useCallback(async (next) => {
    const s = storeFor(cacheKey);
    const normalized = normalizeSchedule(next);
    s.schedule = normalized;
    s.ready = true;
    emit(s);
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

  const { schedule } = snap;
  return {
    schedule,
    loading: snap.loading,
    ready: snap.ready,
    saving,
    save,
    defined: isScheduleDefined(schedule),
    weeklyHours: weeklyHours(schedule),
    activeDays: activeDayCount(schedule),
  };
}
