import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

// Filmin saati: sahneyi ilerletir, sonda basa sarar. `cycle` her turda
// artar; sahneler bununla anahtarlanir ki tekrar izlenince yeniden oynasin.
// Uygulama arka plandayken saat durur, donunce kaldigi sahneden baslar.
export function useFilmClock({ count, duration, autoplay = true }) {
  const [state, setState] = useState({ index: 0, cycle: 0 });
  const [active, setActive] = useState(AppState.currentState === "active");

  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => setActive(s === "active"));
    return () => sub.remove();
  }, []);

  const goTo = useCallback((index) => {
    setState((prev) => {
      const next = ((index % count) + count) % count;
      return { index: next, cycle: next <= prev.index ? prev.cycle + 1 : prev.cycle };
    });
  }, [count]);

  const next = useCallback(() => {
    setState((prev) => {
      const index = (prev.index + 1) % count;
      return { index, cycle: index === 0 ? prev.cycle + 1 : prev.cycle };
    });
  }, [count]);

  const prev = useCallback(() => {
    setState((p) => ({ index: Math.max(0, p.index - 1), cycle: p.cycle + 1 }));
  }, []);

  useEffect(() => {
    if (!autoplay || !active) return undefined;
    const t = setTimeout(next, duration);
    return () => clearTimeout(t);
  }, [state, autoplay, active, duration, next]);

  return { ...state, goTo, next, prev };
}
