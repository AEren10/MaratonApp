import { useCallback, useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
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
  const focused = useIsFocused();
  const userId = user?.id;
  const examKey = examDate ? dateKey(examDate) : null;

  const [state, setState] = useState({ status: "loading", entry: null });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!focused) return undefined;
    if (!userId || !examType || !examKey) {
      setState({ status: "ready", entry: null });
      return undefined;
    }
    let alive = true;
    loadExamResult(userId, examType, examKey)
      .then((entry) => { if (alive) setState({ status: "ready", entry: entry || null }); })
      .catch(() => { if (alive) setState({ status: "error", entry: null }); });
    return () => { alive = false; };
  }, [focused, userId, examType, examKey, reload]);

  const retry = useCallback(() => {
    setState((s) => ({ ...s, status: "loading" }));
    setReload((n) => n + 1);
  }, []);

  return { ...state, examKey, retry };
}
