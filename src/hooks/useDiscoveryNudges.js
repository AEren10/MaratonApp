import { useCallback, useEffect, useMemo, useState } from "react";

import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { useAuth } from "../contexts/AuthContext";
import { useExam } from "../contexts/ExamContext";
import { discoveryNudges } from "../domain/notify/discovery";
import { aytTargetShare } from "../domain/route/examPhase";
import { getJson, setJson } from "../lib/storage/appStorage";

// Kesif popup'lari: ana sayfa popup kuyruguna (base) en basa eklenir. Gosterilen
// kimlik kalici olarak "goruldu" yazilir; ayni davet bir daha cikmaz.
export function useDiscoveryNudges(trials, base = []) {
  const { user } = useAuth();
  const { examType, targetNetTYT, targetNetAYT, targetNet, daysUntilExam } = useExam();
  const key = useMemo(() => userScopedKey(STORAGE_KEYS.DISCOVERY_SEEN, user?.id), [user?.id]);
  // { ids: Set, lastAt: ISO|null } -- eski kayit duz dizi olabilir.
  const [seen, setSeen] = useState(null);

  useEffect(() => {
    let alive = true;
    setSeen(null);
    getJson(key, null).then((raw) => {
      if (!alive) return;
      const ids = Array.isArray(raw) ? raw : raw?.ids || [];
      setSeen({ ids: new Set(ids), lastAt: Array.isArray(raw) ? null : raw?.lastAt || null });
    }).catch(() => { if (alive) setSeen({ ids: new Set(), lastAt: null }); });
    return () => { alive = false; };
  }, [key]);

  const markSeen = useCallback((id) => {
    setSeen((prev) => {
      const ids = new Set(prev?.ids || []);
      ids.add(id);
      const next = { ids, lastAt: new Date().toISOString() };
      setJson(key, { ids: [...ids], lastAt: next.lastAt }).catch(() => {});
      return next;
    });
  }, [key]);

  return useMemo(() => {
    if (!seen) return base;
    const aytExam = aytTargetShare({ examType, daysLeft: 200 }) != null;
    return discoveryNudges({
      trials,
      targets: { tyt: targetNetTYT ?? (aytExam ? null : targetNet), ayt: targetNetAYT },
      aytExam,
      daysLeft: daysUntilExam,
      seen: seen.ids,
      lastShownAt: seen.lastAt,
    }).map((n) => ({ ...n, priority: "high", onShown: () => markSeen(n.id) })).concat(base || []);
  }, [base, seen, trials, examType, targetNetTYT, targetNetAYT, targetNet, daysUntilExam, markSeen]);
}
