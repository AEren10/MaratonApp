import { useCallback, useRef, useState } from "react";

import { usePremium } from "../contexts/PremiumContext";
import { useAlert } from "../contexts/AlertContext";
import { canAccessProductFeature } from "../domain/premium/paywallGate";
import { useLockedFeatureEntry } from "./useLockedFeatureEntry";

// Pro bir ozellige dokunus. canAccessProductFeature erisim bilinmiyorken de
// false doner (sizinti olmasin diye dogru), ama bunu "kilitli" sayip paywall
// acmak Pro uyeye yalan soyler. Burada bilinmeyen once COZULUR, sonra karar
// verilir; cozulemezse dokunus yutulmaz, durum durustce soylenir.
export function useFeatureEntry(featureKey, source = featureKey) {
  const { accessLoading, accessError, accessSnapshot, refreshUsage } = usePremium();
  const enterLocked = useLockedFeatureEntry();
  const showAlert = useAlert();
  const [checking, setChecking] = useState(false);
  const busyRef = useRef(false);

  // true = ozellik acik. false = kilitli (kilit akisi baslatildi) ya da
  // erisim ogrenilemedi (kullaniciya soylendi).
  const ensure = useCallback(async () => {
    if (busyRef.current) return false;

    let features = accessSnapshot?.features;

    if (accessLoading || accessError) {
      busyRef.current = true;
      setChecking(true);
      const snapshot = await refreshUsage().catch(() => null);
      setChecking(false);
      busyRef.current = false;
      if (!snapshot) {
        showAlert(
          "Bağlantı doğrulanamadı",
          "Üyelik durumunu kontrol edemedik. Bağlantını kontrol edip tekrar dene.",
        );
        return false;
      }
      features = snapshot.features;
    }

    if (canAccessProductFeature({ accessState: "ready", features, featureKey })) return true;
    await enterLocked(source);
    return false;
  }, [accessError, accessLoading, accessSnapshot?.features, enterLocked, featureKey,
    refreshUsage, showAlert, source]);

  const open = useCallback(async (onAllowed) => {
    const allowed = await ensure();
    if (allowed) onAllowed?.();
    return allowed;
  }, [ensure]);

  return { open, ensure, checking };
}
