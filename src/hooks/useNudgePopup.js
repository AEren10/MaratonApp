import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { getJson, setJson } from "../lib/storage/appStorage";
import { NUDGE_TYPES } from "../lib/smartNudge";
import { useAuth } from "../contexts/AuthContext";
import { recordRetentionEvent } from "../supabase/retention";
import { RETENTION_EVENTS, RETENTION_SOURCES } from "../constants/retention";
import { todayTR } from "../lib/dateUtils";

const POPUP_TYPES = new Set([
  NUDGE_TYPES.NET_DROP,
  NUDGE_TYPES.IMPROVEMENT,
  NUDGE_TYPES.PERSONAL_RECORD,
  NUDGE_TYPES.STREAK_RISK,
]);

const SHOWN_KEY = STORAGE_KEYS.NUDGE_POPUP_SHOWN;

function todayKey() {
  return todayTR();
}

export function useNudgePopup(nudges) {
  const [popup, setPopup] = useState(null);
  const { user } = useAuth();
  const shownKey = useMemo(() => userScopedKey(SHOWN_KEY, user?.id), [user?.id]);
  const shownRef = useRef(new Set());
  const dayRef = useRef(todayKey());
  const timerRef = useRef(null);
  const pendingIdRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    popupRef.current = popup;
  }, [popup]);

  useEffect(() => {
    const day = todayKey();
    if (dayRef.current !== day) {
      shownRef.current = new Set();
      dayRef.current = day;
    }
    getJson(shownKey).then((parsed) => {
      if (parsed?.day === day) shownRef.current = new Set(parsed.ids || []);
    }).catch(() => {});
  }, [shownKey]);

  const showNext = useCallback((delay = 1200) => {
    if (!nudges || !nudges.length || popupRef.current || timerRef.current) return;
    const candidate = nudges.find(
      (n) => {
        const id = n.type + (n.subject || "");
        return POPUP_TYPES.has(n.type) && !shownRef.current.has(id) && pendingIdRef.current !== id;
      },
    );
    if (!candidate) return;
    const id = candidate.type + (candidate.subject || "");
    pendingIdRef.current = id;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (pendingIdRef.current !== id) return;
      pendingIdRef.current = null;
      setPopup(candidate);
      shownRef.current.add(id);
      setJson(shownKey, { day: todayKey(), ids: [...shownRef.current] }).catch(() => {});
      if (user?.id) {
        recordRetentionEvent(
          user.id,
          RETENTION_EVENTS.NUDGE_SHOWN,
          { id, type: candidate.type, subject: candidate.subject || null, priority: candidate.priority || null },
          RETENTION_SOURCES.NUDGE_POPUP,
        ).catch(() => {});
      }
    }, delay);
  }, [nudges, shownKey, user?.id]);

  useEffect(() => () => {
    pendingIdRef.current = null;
    clearTimeout(timerRef.current);
  }, []);

  const dismiss = useCallback(() => {
    if (popup && user?.id) {
      recordRetentionEvent(
        user.id,
        RETENTION_EVENTS.NUDGE_DISMISSED,
        { type: popup.type, subject: popup.subject || null, priority: popup.priority || null },
        RETENTION_SOURCES.NUDGE_POPUP,
      ).catch(() => {});
    }
    setPopup(null);
  }, [popup, user?.id]);

  return { popup, showNext, dismiss };
}
