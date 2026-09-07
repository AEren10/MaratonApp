import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { getQueueSize, getDeadLetterCount } from "../lib/offlineQueue";

/**
 * Bekleyen ve başarısız yazmaların sayısı.
 *
 * Neden var: offline kuyruk sessizdi. Bir kayıt kalıcı olarak başarısız
 * olduğunda dead-letter'a düşüyor ve kullanıcı bunu ASLA öğrenmiyordu —
 * "kaydettim" sanıp veriyi kaybediyordu. getDeadLetterCount export edilmişti
 * ama hiçbir ekran okumuyordu.
 *
 * Yeni tasarım bunu bir uyarı şeridi / ayarlar satırı olarak gösterebilsin
 * diye veri katmanı burada hazır duruyor.
 *
 *   const { pending, failed, hasProblem, refresh } = usePendingWrites();
 */
export function usePendingWrites({ pollOnForeground = true } = {}) {
  const [pending, setPending] = useState(0);
  const [failed, setFailed] = useState(0);

  const refresh = useCallback(async () => {
    const [q, d] = await Promise.all([
      getQueueSize().catch(() => 0),
      getDeadLetterCount().catch(() => 0),
    ]);
    setPending(q);
    setFailed(d);
  }, []);

  useEffect(() => {
    let active = true;
    const run = () => { if (active) refresh(); };
    run();

    if (!pollOnForeground) return () => { active = false; };

    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") run();
    });
    return () => {
      active = false;
      sub?.remove?.();
    };
  }, [refresh, pollOnForeground]);

  return {
    pending,
    failed,
    hasProblem: failed > 0,
    isSyncing: pending > 0,
    refresh,
  };
}
