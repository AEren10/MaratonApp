import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import { getDueWrongCount } from "../supabase/wrongQuestions";

/**
 * Bugün tekrarı gelen yanlış sayısı.
 *
 * NEDEN VAR
 * Aralıklı tekrar algoritması sessizce çalışıyordu: `next_review_at` doluyor,
 * sorular birikiyor, ama öğrenci Deftere kendi girmedikçe bunu ASLA
 * öğrenmiyordu. Uygulamanın net kazandıran tek mekanizması görünmez olunca
 * kullanılmıyor.
 *
 * Ana Sayfa kartındaki eski not "güvenilir sayaç kaynağı yok, sayı
 * uydurulmaz" diyordu — kaynak varmış, yalnızca hiç bağlanmamış.
 */
export function useDueReviews(userId) {
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId || userId === "dev") { setCount(0); setLoaded(true); return; }
    try {
      setCount(await getDueWrongCount(userId));
    } catch {
      // Sayı alınamazsa kart sayısız haline döner; ekran bozulmaz.
      setCount(0);
    } finally {
      setLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    let active = true;
    const run = () => { if (active) refresh(); };
    run();
    // Tekrar oturumu başka ekranda bitmiş olabilir; öne gelince tazelenir.
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") run();
    });
    return () => { active = false; sub?.remove?.(); };
  }, [refresh]);

  return { dueCount: count, dueLoaded: loaded, refreshDue: refresh };
}
