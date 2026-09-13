import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { flushQueue, getPendingStudyLogs, getPendingWrongQuestions } from "../lib/offlineQueue";
import { captureError } from "../lib/errorReporting";
import * as H from "../lib/haptics";

// "Oturum Kaydedilemedi" hali. Kayit sunucuya yazilamayip kuyruga dustugunde
// kayit akisi (yan etkiler dahil) aynen tamamlanir; yalniz son adimda ozet
// yerine bu hal gosterilir. "Simdi tekrar dene" AYNI kuyruk ogesini
// (ayni client_operation_id + payload) gonderir, yeni kayit uretmez.
export function useUnsavedSession() {
  const { user } = useAuth();
  const [pending, setPending] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [queue, setQueue] = useState({ sessions: 0, notebook: 0 });

  const readQueueCounts = useCallback(async () => {
    if (!user?.id) return;
    const [logs, wrongs] = await Promise.all([
      getPendingStudyLogs(user.id).catch(() => []),
      getPendingWrongQuestions(user.id).catch(() => []),
    ]);
    setQueue({ sessions: logs.length, notebook: wrongs.length });
    return logs;
  }, [user?.id]);

  useEffect(() => {
    if (pending) readQueueCounts();
  }, [pending, readQueueCounts]);

  // pending: { clientOperationId, minutes, questions, topic, studyDate, onContinue }
  const show = useCallback((next) => setPending(next), []);

  const retry = useCallback(async () => {
    if (!pending || retrying) return;
    setRetrying(true);
    try {
      await flushQueue();
      const logs = await readQueueCounts();
      const stillQueued = (logs || []).some((p) => p.client_operation_id === pending.clientOperationId);
      if (!stillQueued) {
        H.success();
        pending.onContinue?.();
        return;
      }
      H.error();
    } catch (e) {
      H.error();
      captureError(e, { context: "study_unsaved_retry" });
    } finally {
      setRetrying(false);
    }
  }, [pending, retrying, readQueueCounts]);

  const later = useCallback(() => {
    H.tap();
    pending?.onContinue?.();
  }, [pending]);

  return { pending, show, retry, later, retrying, queue };
}
