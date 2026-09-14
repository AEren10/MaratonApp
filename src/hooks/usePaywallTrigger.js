import { useCallback, useEffect, useRef } from "react";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { usePremium } from "../contexts/PremiumContext";
import { useAuth } from "../contexts/AuthContext";
import { getString, setString } from "../lib/storage/appStorage";
import { incrementSessionCount } from "../supabase/profiles";
import { recordRetentionEvent } from "../supabase/retention";
import { RETENTION_EVENTS, RETENTION_SOURCES } from "../constants/retention";

const SESSION_THRESHOLD = 3;

export function usePaywallTrigger() {
  const { showPaywall } = usePremium();
  const { user } = useAuth();
  const timerRef = useRef(null);

  const incrementAndCheck = useCallback(async () => {
    const serverCount = user?.id ? await incrementSessionCount(user.id).catch(() => null) : null;
    if (user?.id) {
      recordRetentionEvent(
        user.id,
        RETENTION_EVENTS.STUDY_SESSION_INCREMENTED,
        { serverCount },
        RETENTION_SOURCES.STUDY_SUMMARY,
      ).catch(() => {});
    }

    try {
      const shownKey = userScopedKey(STORAGE_KEYS.PAYWALL_SHOWN_SESSION, user?.id);
      const sessionCountKey = userScopedKey(STORAGE_KEYS.STUDY_SESSION_COUNT, user?.id);
      const shown = await getString(shownKey);
      if (shown === "true") return false;

      const raw = await getString(sessionCountKey);
      const count = (parseInt(raw, 10) || 0) + 1;
      await setString(sessionCountKey, String(count));
      const effectiveCount = Math.max(count, serverCount || 0);

      if (effectiveCount >= SESSION_THRESHOLD) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [user?.id]);

  const showDelayedPaywall = useCallback((delayMs = 2000, source = "study_session_threshold") => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const opened = showPaywall(source);
      if (opened) {
        await setString(userScopedKey(STORAGE_KEYS.PAYWALL_SHOWN_SESSION, user?.id), "true");
      }
    }, delayMs);
    return () => clearTimeout(timerRef.current);
  }, [showPaywall, user?.id]);

  const cleanup = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  // Çağıran ekran unmount olursa gecikmeli paywall yine de açılıyordu.
  // Temizliği manuel cleanup()'a bırakma; hook kendi sorumluluğunu alsın.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { incrementAndCheck, showDelayedPaywall, cleanup };
}
