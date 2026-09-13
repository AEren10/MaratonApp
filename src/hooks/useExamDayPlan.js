import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { useExam } from "../contexts/ExamContext";
import {
  bagItems, isValidTime, planHasContent, reminderCaption, sanitizeTimeInput, normalizeExamDayPlan,
} from "../domain/exam/examDayPlan";
import { loadExamDayPlan, saveExamDayPlan } from "../lib/examDayPlanStore";
import * as H from "../lib/haptics";

// "Sınav günü planı" ekraninin tek veri kaynagi. Taslak ham tutulur (yarim
// saat girdisi "07:" gibi); kaydederken normalize edilir.
export function useExamDayPlan() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { examDate } = useExam();
  const userId = user?.id;

  const [draft, setDraft] = useState(() => normalizeExamDayPlan(null));
  const [status, setStatus] = useState("loading");
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    loadExamDayPlan(userId)
      .then(({ plan }) => { if (alive) { setDraft(plan); setStatus("ready"); } })
      .catch(() => { if (alive) setStatus("error"); });
    return () => { alive = false; };
  }, [userId, reload]);

  const setField = useCallback((key, value) => {
    setDraft((d) => ({ ...d, [key]: key === "leaveAt" ? sanitizeTimeInput(value) : value }));
  }, []);

  const toggleItem = useCallback((key) => {
    H.select();
    setDraft((d) => {
      const checked = { ...d.checked };
      if (checked[key]) delete checked[key];
      else checked[key] = true;
      return { ...d, checked };
    });
  }, []);

  const addExtra = useCallback((label) => {
    const text = String(label || "").trim();
    if (!text) return;
    H.tap();
    setDraft((d) => ({ ...d, extras: [...d.extras, { key: `x${Date.now()}`, label: text }] }));
  }, []);

  const toggleRemind = useCallback(() => {
    H.select();
    setDraft((d) => ({ ...d, remind: !d.remind }));
  }, []);

  const leaveAtInvalid = Boolean(draft.leaveAt) && !isValidTime(draft.leaveAt);

  const save = useCallback(async () => {
    if (leaveAtInvalid || !planHasContent(draft)) return;
    setSaving(true);
    try {
      await saveExamDayPlan(userId, draft, examDate);
      H.success();
      navigation.goBack();
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }, [draft, examDate, leaveAtInvalid, navigation, userId]);

  const items = useMemo(() => bagItems(draft), [draft]);

  return {
    status,
    draft,
    items,
    caption: reminderCaption(examDate),
    canSave: planHasContent(draft) && !leaveAtInvalid,
    leaveAtInvalid,
    saving,
    setField,
    toggleItem,
    addExtra,
    toggleRemind,
    save,
    retry: () => setReload((n) => n + 1),
    back: navigation.goBack,
  };
}
