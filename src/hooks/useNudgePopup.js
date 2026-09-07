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

  useEffect(() => {
    const day = todayKey();
    if (dayRef.current !== day) {
      shownRef.current = new Set();
      dayRef.current = day;
    }
    getJson(shownKey).then((parsed) => {
      if (parsed?.day === day) shownRef.current = new Set(parsed.ids || []);
    });
  }, [shownKey]);

  const showNext = useCallback((delay = 1200) => {
    if (!nudges || !nudges.length) return;
    const candidate = nudges.find(
      (n) => POPUP_TYPES.has(n.type) && !shownRef.current.has(n.type + (n.subject || "")),
    );
    if (!candidate) return;
    const id = candidate.type + (candidate.subject || "");
    shownRef.current.add(id);
    setJson(shownKey, { day: todayKey(), ids: [...shownRef.current] });
    timerRef.current = setTimeout(() => {
      setPopup(candidate);
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

  useEffect(() => () => clearTimeout(timerRef.current), []);

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
