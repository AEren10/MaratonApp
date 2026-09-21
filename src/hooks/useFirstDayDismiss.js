import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { getJson, setJson } from "../lib/storage/appStorage";

// Ilk Gun hero'su Home govdesinin TAMAMINI gizliyor (HomeHero.showBelow) ve
// tek cikis yolu veri girmekti: durak tamamlanmadan, deneme girilmeden,
// seri baslamadan Ana Sayfa'nin geri kalani HIC gorulemiyordu. Karsilama
// ekrani gibi duran ama cikisi olmayan bir kapan.
//
// Bu bayrak kullaniciya kapiyi aciyor: bir kez "ana sayfayi goster" dedi mi
// Ilk Gun hero'su bir daha onune cikmaz. Karar kullanicinin, geri alinmaz.
export function useFirstDayDismiss() {
  const { user } = useAuth();
  const userId = user?.id && user.id !== "dev" ? user.id : null;
  const key = useMemo(() => userScopedKey(STORAGE_KEYS.HOME_FIRST_DAY_DISMISSED, userId), [userId]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getJson(key, false)
      .then((v) => { if (!cancelled) setDismissed(!!v); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [key]);

  // Yazim basarisiz olsa bile ekran ACILIR: kullanici bekletilmez, en kotu
  // ihtimalle bir sonraki acilista karsilama bir kez daha gorunur.
  const dismiss = useCallback(() => {
    setDismissed(true);
    setJson(key, true).catch(() => {});
  }, [key]);

  return { dismissed, dismiss };
}
