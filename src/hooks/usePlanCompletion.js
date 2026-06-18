import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as H from "../lib/haptics";

const getKey = () => `@plan_done_${new Date().toISOString().split("T")[0]}`;

export function usePlanCompletion() {
  const [doneIds, setDoneIds] = useState(new Set());

  useEffect(() => {
    AsyncStorage.getItem(getKey()).then((val) => {
      if (val) {
        try { setDoneIds(new Set(JSON.parse(val))); } catch {}
      }
    });
  }, []);

  const toggle = useCallback((id) => {
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else { next.add(id); H.success(); }
      AsyncStorage.setItem(getKey(), JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isDone = useCallback((id) => doneIds.has(id), [doneIds]);

  return { doneIds, isDone, toggle };
}
