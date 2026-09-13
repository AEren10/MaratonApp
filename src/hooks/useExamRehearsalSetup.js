import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useExam } from "../contexts/ExamContext";
import {
  rehearsalSessions, rehearsalDateOptions, reminderLine, isRehearsalDay,
} from "../domain/exam/examRehearsal";
import { isValidTime, sanitizeTimeInput } from "../domain/exam/examDayPlan";
import { loadRehearsal, saveRehearsal } from "../lib/examRehearsalStore";
import * as H from "../lib/haptics";

// "Deneme Provası" kurulum formu. Kayit cihazda; hatirlatma kayitla kurulur.
// Kurulu prova bugunse ekran ayni formdan oturumu baslatabilir.
export function useExamRehearsalSetup() {
  const { user } = useAuth();
  const { examType, examDate } = useExam();
  const userId = user?.id;

  const sessions = useMemo(() => rehearsalSessions(examType), [examType]);
  const dateOptions = useMemo(() => rehearsalDateOptions(examDate), [examDate]);

  const [status, setStatus] = useState("loading");
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(() => ({
    dateKey: dateOptions[1] || dateOptions[0] || null,
    start: sessions[0].start,
    sessionKey: sessions[0].key,
    source: "",
  }));
  const [open, setOpen] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    loadRehearsal(userId)
      .then((r) => {
        if (!alive) return;
        if (r) { setSaved(r); setForm((f) => ({ ...f, ...r })); }
        setStatus("ready");
      })
      .catch(() => { if (alive) setStatus("ready"); });
    return () => { alive = false; };
  }, [userId]);

  const session = sessions.find((x) => x.key === form.sessionKey) || sessions[0];

  const update = useCallback((key, value) => {
    H.select();
    setForm((f) => {
      if (key === "start") return { ...f, start: sanitizeTimeInput(value) };
      if (key === "sessionKey") {
        const next = sessions.find((x) => x.key === value);
        return { ...f, sessionKey: value, start: next?.start || f.start };
      }
      return { ...f, [key]: value };
    });
  }, [sessions]);

  const toggleOpen = useCallback((row) => setOpen((o) => (o === row ? null : row)), []);

  const valid = Boolean(form.dateKey) && isValidTime(form.start);

  const save = useCallback(async () => {
    if (!valid) return false;
    setSaving(true);
    try {
      const record = { ...form, source: form.source.trim(), minutes: session.minutes };
      await saveRehearsal(userId, record);
      setSaved(record);
      H.success();
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, [form, session, userId, valid]);

  return {
    status,
    form,
    session,
    sessions,
    dateOptions,
    open,
    toggleOpen,
    update,
    valid,
    saving,
    save,
    reminder: reminderLine(form.start),
    startableToday: Boolean(saved) && isRehearsalDay(saved),
    userId,
  };
}
