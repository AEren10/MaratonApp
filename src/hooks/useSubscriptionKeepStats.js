import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { useAuth } from "../contexts/AuthContext";
import { selectStreak } from "../store/slices/studyLogSlice";
import { getTopicProgress } from "../supabase/topicProgress";
import { getWrongQuestionCount } from "../supabase/wrongQuestions";

// IPTAL EKRANININ "KALIR" SAYILARI
//
// Uc sayi da GERCEK kayittan geliyor: soru toplami topic_progress'ten,
// seri Redux'tan (sunucu ile senkron), defter sorusu wrong_questions
// sayimindan. Alinamayan sayi listeden DUSUYOR -- sifir yazilmiyor, cunku
// "0 soru kaydi" ile "sayiyi okuyamadik" ayni sey degil.

export function useSubscriptionKeepStats() {
  const { user } = useAuth();
  const streak = useSelector(selectStreak);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ questions: null, wrongs: null });

  const load = useCallback(async () => {
    if (!user?.id || user.id === "dev") {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [progress, wrongs] = await Promise.allSettled([
      getTopicProgress(user.id),
      getWrongQuestionCount(user.id),
    ]);
    setCounts({
      questions: progress.status === "fulfilled" && Array.isArray(progress.value)
        ? progress.value.reduce((sum, row) => sum + (Number(row.total_questions) || 0), 0)
        : null,
      wrongs: wrongs.status === "fulfilled" ? wrongs.value : null,
    });
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const stats = [
    { key: "questions", value: counts.questions, label: "soru kaydı" },
    { key: "streak", value: streak > 0 ? streak : null, label: "gün seri" },
    { key: "wrongs", value: counts.wrongs, label: "defter sorusu" },
  ].filter((item) => item.value != null);

  return { loading, stats };
}
