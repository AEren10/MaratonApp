import { useState, useCallback, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NUDGE_TYPES } from "../lib/smartNudge";

const POPUP_TYPES = new Set([
  NUDGE_TYPES.NET_DROP,
  NUDGE_TYPES.IMPROVEMENT,
  NUDGE_TYPES.PERSONAL_RECORD,
  NUDGE_TYPES.STREAK_RISK,
]);

const SHOWN_KEY = "@nudge_popup_shown";

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

export function useNudgePopup(nudges) {
  const [popup, setPopup] = useState(null);
  const shownRef = useRef(new Set());
  const dayRef = useRef(todayKey());
  const timerRef = useRef(null);

  useEffect(() => {
    const day = todayKey();
    if (dayRef.current !== day) {
      shownRef.current = new Set();
      dayRef.current = day;
    }
    AsyncStorage.getItem(SHOWN_KEY).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed.day === day) shownRef.current = new Set(parsed.ids || []);
      } catch {}
    });
  }, []);

  const showNext = useCallback((delay = 1200) => {
    if (!nudges || !nudges.length) return;
    const candidate = nudges.find(
      (n) => POPUP_TYPES.has(n.type) && !shownRef.current.has(n.type + (n.subject || "")),
    );
    if (!candidate) return;
    const id = candidate.type + (candidate.subject || "");
    shownRef.current.add(id);
    AsyncStorage.setItem(
      SHOWN_KEY,
      JSON.stringify({ day: todayKey(), ids: [...shownRef.current] }),
    ).catch(() => {});
    timerRef.current = setTimeout(() => setPopup(candidate), delay);
  }, [nudges]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const dismiss = useCallback(() => setPopup(null), []);

  return { popup, showNext, dismiss };
}
