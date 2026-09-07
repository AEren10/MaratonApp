import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { loadGoalsFromStorage } from "./slices/goalsSlice";
import { loadGamificationFromStorage } from "./slices/gamificationSlice";
import { useAuth } from "../contexts/AuthContext";

/**
 * Yerel (AsyncStorage) verinin Redux'a hidrasyonu.
 *
 * Önceden bağımlılığı yalnızca [dispatch] idi ve AuthProvider'ın DIŞINDA
 * duruyordu: uygulama ömrü boyunca bir kez çalışıyordu. Çıkış→giriş sonrası
 * RESET_STORE store'u boşaltıyor ama yerel hidrasyon bir daha çalışmıyordu;
 * sunucudan loadAll gelene kadar XP ve hedefler 0 görünüyor, sonra aniden
 * doluyordu (yanıp sönme). Artık kullanıcı kimliğine bağlı.
 */
export function ReduxHydrator() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const guard = (action) => { if (!cancelled) dispatch(action); };
    loadGoalsFromStorage(guard).catch(() => {});
    loadGamificationFromStorage(guard).catch(() => {});
    return () => { cancelled = true; };
  }, [dispatch, userId]);

  return null;
}
