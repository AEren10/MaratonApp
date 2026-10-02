import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

// Ekrana her DONUSTE artan sayac: grafigin anahtari yapilir, cizim animasyonu
// bastan oynar (kullanici, 3 Ekim). Ilk acilista artmaz (zaten ciziliyor).
export function useReplayOnFocus() {
  const [tick, setTick] = useState(0);
  const first = useRef(true);
  useFocusEffect(useCallback(() => {
    if (first.current) { first.current = false; return; }
    setTick((t) => t + 1);
  }, []));
  return tick;
}
