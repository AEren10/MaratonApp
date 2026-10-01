import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { useAuth } from "../contexts/AuthContext";
import { buildStopStudyLogs, stopLogOperationIds } from "../domain/plan/stopStudyLog";
import { applyStreak } from "../lib/applyStreak";
import { todayTR } from "../lib/dateUtils";
import { recordStopCompletion, removeStopCompletion } from "../lib/stopCompletionLog";
import { addLog, removeLogsByOperationIds } from "../store/slices/studyLogSlice";

// DURAK TAMAMLAMA -- tek komut. Ana sayfa ve "Programin tamami" ayni yoldan:
//  1) kayit bugunun listesine ANINDA girer (ana sayfa soru/dakika kipirdar;
//     useStreakReminderSync aksamki seri uyarisini iptal eder),
//  2) sunucuya / kuyruga yazilir,
//  3) sunucunun seri sonucu ekrana uygulanir.
// Geri alma ayni islem kimlikleriyle listeden ve sunucudan siler.
export function useStopCompletion() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const uid = user?.id && user.id !== "dev" ? user.id : null;

  const complete = useCallback(async (stop) => {
    if (!uid || !stop) return null;
    for (const log of buildStopStudyLogs({ stop, userId: uid, studyDate: todayTR() })) dispatch(addLog(log));
    const res = await recordStopCompletion(uid, stop).catch(() => null);
    applyStreak(dispatch, res);
    return res;
  }, [dispatch, uid]);

  const undo = useCallback(async (stop) => {
    if (!uid || !stop) return false;
    dispatch(removeLogsByOperationIds(stopLogOperationIds(stop)));
    return removeStopCompletion(uid, stop).catch(() => false);
  }, [dispatch, uid]);

  return { complete, undo };
}
