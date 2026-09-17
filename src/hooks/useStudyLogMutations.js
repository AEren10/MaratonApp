import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { useSync } from "../contexts/DataSyncContext";
import { deleteStudyLog, updateStudyLog } from "../supabase/studyLogs";
import { removeLog } from "../store/slices/studyLogSlice";
import { captureError } from "../lib/errorReporting";
import * as H from "../lib/haptics";

// Calisma kaydi silme/duzenleme. Sunucu otoritedir: basarili yazimdan sonra
// Redux'taki gunluk kayitlar sunucudan yeniden yuklenir (useSync.refresh).
export function useStudyLogMutations() {
  const dispatch = useDispatch();
  const showAlert = useAlert();
  const { user } = useAuth();
  const { refresh } = useSync();

  const confirmDelete = useCallback((log, { onOptimistic, onRollback, onDeleted } = {}) => {
    if (!log?.id || !user?.id) return;
    const label = log.topic || log.subject || "Bu kayıt";
    H.warn();
    showAlert("Kaydı sil", `"${label}" silinecek. Soru sayısı ve süre istatistiklerinden düşülür.`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          onOptimistic?.(log);
          dispatch(removeLog(log.id));
          try {
            await deleteStudyLog(log.id, user.id);
            refresh?.();
            onDeleted?.(log);
          } catch (_) {
            onRollback?.(log);
            refresh?.();
            showAlert("Silinemedi", "Kayıt silinemedi, geri alındı. Bağlantını kontrol et.");
          }
        },
      },
    ]);
  }, [user?.id, dispatch, showAlert, refresh]);

  const update = useCallback(async (id, patch) => {
    if (!id || !user?.id) throw new Error("missing_id");
    try {
      const updated = await updateStudyLog(id, { ...patch, user_id: user.id });
      refresh?.();
      return updated;
    } catch (e) {
      captureError(e, { context: "study_log_update" });
      throw e;
    }
  }, [user?.id, refresh]);

  return { confirmDelete, update };
}
