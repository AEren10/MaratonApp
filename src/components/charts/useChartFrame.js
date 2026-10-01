import { useCallback, useState } from "react";

import { CHART_W, chartFrame } from "./chartStyle";

// Grafigin kutusunu olcer; genis ekranda tuval genisligini (vbW) ve
// yuksekligi verir. Olcum gelene kadar telefon olculeri kullanilir.
export function useChartFrame(height) {
  const [w, setW] = useState(0);
  const onLayout = useCallback((e) => {
    const next = Math.round(e.nativeEvent.layout.width);
    setW((prev) => (prev === next ? prev : next));
  }, []);
  const frame = chartFrame(w, height);
  return { onLayout, vbW: frame?.vbW ?? CHART_W, wide: frame ? { height: frame.h, aspectRatio: undefined } : null };
}
