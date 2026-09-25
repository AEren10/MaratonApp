import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "react-native-reanimated";

// Sayac 60fps'te DONMEZ: o hizda rakamlar okunmayan bir bulaniga doner.
// ~13 kademe, sayildigini gosterecek kadar yavas, beklenmeyecek kadar hizli.
const RISE_MS = 700;
const STEP_MS = 55;

// ANIMATION.easing.easeOut ile ayni his: hizli baslar, hedefte yumusar.
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Ilk montajda 0'dan `value`'ya cikan sayi dondurur.
 *
 * Sonraki degisiklikler ANINDA yazilir. Bir durak tikleyince sayinin
 * bastan sayilmasi "az once yaptigin sey" degil "sayfa yeniden yuklendi"
 * gibi okunur -- oysa o an kullanici tek bir artisi bekliyor.
 */
export function useCountUp(value) {
  const target = Number.isFinite(value) ? value : 0;
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? target : 0);
  const risen = useRef(false);

  useEffect(() => {
    if (risen.current || reduced || target === 0) {
      risen.current = true;
      setShown(target);
      return undefined;
    }
    risen.current = true;

    const started = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / RISE_MS);
      setShown(Math.round(target * easeOut(t)));
      if (t >= 1) clearInterval(id);
    }, STEP_MS);

    return () => clearInterval(id);
  }, [target, reduced]);

  return shown;
}

/**
 * Halka/cubuk dolgusu icin 0 -> oran. Sayaci ile ayni kural: yalniz ilk
 * montajda dolar, sonraki degisiklikler aninda yansir.
 */
export function useRingFill(value) {
  const target = Number.isFinite(value) ? value : 0;
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? target : 0);
  const filled = useRef(false);

  useEffect(() => {
    if (filled.current || reduced || target === 0) {
      filled.current = true;
      setShown(target);
      return undefined;
    }
    filled.current = true;

    const started = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / RISE_MS);
      setShown(target * easeOut(t));
      if (t >= 1) clearInterval(id);
    }, STEP_MS);

    return () => clearInterval(id);
  }, [target, reduced]);

  return shown;
}
