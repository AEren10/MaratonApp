import { useCallback, useEffect, useRef } from "react";

import {
  trackFormAbandoned,
  trackFormCompleted,
  trackFormStarted,
} from "../lib/analytics";

export function useFormLifecycleAnalytics(form, props = {}, active = true) {
  const started = useRef(false);
  const dirty = useRef(false);
  const completed = useRef(false);
  const latestProps = useRef(props);
  latestProps.current = props;

  useEffect(() => {
    if (!active || started.current) return undefined;
    started.current = true;
    trackFormStarted(form, latestProps.current);
    return () => {
      if (dirty.current && !completed.current) {
        trackFormAbandoned(form, latestProps.current);
      }
    };
  }, [active, form]);

  const markFormDirty = useCallback((extra = {}) => {
    dirty.current = true;
    latestProps.current = { ...latestProps.current, ...extra };
  }, []);

  const completeForm = useCallback((extra = {}) => {
    completed.current = true;
    trackFormCompleted(form, { ...latestProps.current, ...extra });
  }, [form]);

  return { completeForm, markFormDirty };
}
