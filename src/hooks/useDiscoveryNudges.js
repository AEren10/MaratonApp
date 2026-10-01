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
  const [seen, setSeen] = useState(null);

  useEffect(() => {
    let alive = true;
    setSeen(null);
    getJson(key, []).then((ids) => { if (alive) setSeen(new Set(Array.isArray(ids) ? ids : [])); })
      .catch(() => { if (alive) setSeen(new Set()); });
    return () => { alive = false; };
  }, [key]);

  const markSeen = useCallback((id) => {
    setSeen((prev) => {
      const next = new Set(prev || []);
      next.add(id);
      setJson(key, [...next]).catch(() => {});
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
      seen,
    }).map((n) => ({ ...n, priority: "high", onShown: () => markSeen(n.id) })).concat(base || []);
  }, [base, seen, trials, examType, targetNetTYT, targetNetAYT, targetNet, daysUntilExam, markSeen]);
}
