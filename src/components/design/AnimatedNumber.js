import { useEffect, useState } from "react";
import { Text } from "react-native";

export function AnimatedNumber({
  value = 0,
  duration = 900,
  format = (v) => Math.round(v),
  style,
  enabled = true,
}) {
  const [display, setDisplay] = useState(enabled ? 0 : value);

  useEffect(() => {
    if (!enabled) {
      setDisplay(value);
      return;
    }
    let raf;
    let start;
    const from = display;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (value - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, enabled]);

  return <Text style={style}>{format(display)}</Text>;
}
