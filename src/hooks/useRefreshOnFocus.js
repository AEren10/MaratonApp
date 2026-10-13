import { useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";

// Sekmeler arka planda ACIK kalir: veriyi yalniz ilk acilista okuyan ekran,
// baska sekmede yapilan isi gostermez ("kaydedilmedi" sanilir; Profil'de
// 0/17, 12 Ekim). Ekrana her DONUSTE sessizce tazeler. Ilk acilista
// calismaz (zaten yukleniyor), sekme gecisi oturduktan sonra baslar ve
// `minGapMs` icinde ikinci kez istek atmaz.
export function useRefreshOnFocus(refresh, { minGapMs = 15000 } = {}) {
  const first = useRef(true);
  const last = useRef(0);
  useFocusEffect(useCallback(() => {
    if (first.current) { first.current = false; last.current = Date.now(); return undefined; }
    if (Date.now() - last.current < minGapMs) return undefined;
    const timer = setTimeout(() => { last.current = Date.now(); refresh?.(); }, 400);
    return () => clearTimeout(timer);
  }, [refresh, minGapMs]));
}
