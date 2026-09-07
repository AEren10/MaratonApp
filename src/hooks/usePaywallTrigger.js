import { useCallback, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { SCREENS } from "../constants/screens";
import { usePremium } from "../contexts/PremiumContext";
import { useAuth } from "../contexts/AuthContext";
import { getString, setString } from "../lib/storage/appStorage";
import { incrementSessionCount } from "../supabase/profiles";
import { recordRetentionEvent } from "../supabase/retention";
import { RETENTION_EVENTS, RETENTION_SOURCES } from "../constants/retention";
import { canShowPaywall } from "../domain/premium/paywallGate";
import { getExamPhase } from "../domain/exam/examPhase";
import { useExam } from "../contexts/ExamContext";

const SESSION_THRESHOLD = 3;

export function usePaywallTrigger() {
  const navigation = useNavigation();
  const { isPremium } = usePremium();
  const { user } = useAuth();
  const { examDate } = useExam();
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

    // Paywall kapısı: ilk 7 gün muafiyeti + sınav günü/arifesi koruması.
    // Önceden yalnızca oturum sayısına bakılıyordu, yeni kullanıcı daha ilk
    // gününde paywall görebiliyordu.
    const gate = canShowPaywall({
      isPremium,
      createdAt: user?.created_at,
      examPhase: getExamPhase(examDate).phase,
    });
    if (!gate.allowed) {
      if (user?.id && gate.reason && gate.reason !== "already_premium") {
        recordRetentionEvent(
          user.id,
          RETENTION_EVENTS.PAYWALL_SUPPRESSED,
          { reason: gate.reason, dayNumber: gate.dayNumber ?? null },
          RETENTION_SOURCES.STUDY_SUMMARY,
        ).catch(() => {});
      }
      return false;
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
        await setString(shownKey, "true");
        if (user?.id) {
          recordRetentionEvent(
            user.id,
            RETENTION_EVENTS.PAYWALL_TRIGGERED,
            { localCount: count, serverCount, threshold: SESSION_THRESHOLD },
            RETENTION_SOURCES.STUDY_SUMMARY,
          ).catch(() => {});
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [isPremium, user?.id, user?.created_at, examDate]);

  const showDelayedPaywall = useCallback((delayMs = 2000, source = "study_session_threshold") => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      navigation.navigate(SCREENS.PAYWALL, { source });
    }, delayMs);
    return () => clearTimeout(timerRef.current);
  }, [navigation]);

  const cleanup = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  // Çağıran ekran unmount olursa gecikmeli paywall yine de açılıyordu.
  // Temizliği manuel cleanup()'a bırakma; hook kendi sorumluluğunu alsın.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { incrementAndCheck, showDelayedPaywall, cleanup };
}
