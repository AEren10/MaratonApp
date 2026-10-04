import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { useExam } from "../contexts/ExamContext";
import { dateKey } from "../lib/dateUtils";
import { loadExamResult } from "../lib/examResultRepository";

// Rotanin sinavina (tur + tarih) ait kayitli sonuc. Ekran odaga her
// geldiginde yeniden okunur: Sinav Sonucu kaydedip donunce Profil satiri ve
// Ana Sayfa girisi guncel olsun.
export function useExamResultEntry() {
  const { user } = useAuth();
  const { examType, examDate } = useExam();
  const userId = user?.id;
  const examKey = examDate ? dateKey(examDate) : null;

  const [state, setState] = useState({ status: "loading", entry: null });
  const [reload, setReload] = useState(0);

  // useFocusEffect, useIsFocused degil: odak kaybinda ekrani yeniden
  // cizdirmesin. Ayni sonuc tekrar okununca durum degismez (yeniden cizim yok).
  useFocusEffect(useCallback(() => {
    if (!userId || !examType || !examKey) {
      setState((s) => settle(s, "ready", null));
      return undefined;
    }
    let alive = true;
    loadExamResult(userId, examType, examKey)
      .then((entry) => { if (alive) setState((s) => settle(s, "ready", entry || null)); })
      .catch(() => { if (alive) setState((s) => settle(s, "error", null)); });
    return () => { alive = false; };
  }, [userId, examType, examKey, reload]));

  const retry = useCallback(() => {
    setState((s) => ({ ...s, status: "loading" }));
    setReload((n) => n + 1);
  }, []);

  return { ...state, examKey, retry };
}

function settle(prev, status, entry) {
  if (prev.status === status && JSON.stringify(prev.entry) === JSON.stringify(entry)) return prev;
  return { status, entry };
}
