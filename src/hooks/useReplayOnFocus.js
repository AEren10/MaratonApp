import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

// Ekrana her DONUSTE artan sayac: grafik animasyonu bastan oynar (kullanici,
// 3 Ekim). Ilk acilista artmaz. ANAHTAR YAPILMAZ (grafigi sokup kurmak sekme
// gecisini kasiyordu, 4 Ekim); bileşenler degerini izleyip animasyonu yeniden
// baslatir. Sayac sekme gecisi OTURDUKTAN sonra artar (ayni karede yeniden
// cizim yapilmasin).
export function useReplayOnFocus() {
  const [tick, setTick] = useState(0);
  const first = useRef(true);
  useFocusEffect(useCallback(() => {
    if (first.current) { first.current = false; return undefined; }
    // 360ms: tabbar hapinin kayisi (320ms) bitsin; cubuklar onunla yarismasin.
    const timer = setTimeout(() => setTick((t) => t + 1), 360);
    return () => clearTimeout(timer);
  }, []));
  return tick;
}
