import { useState, useEffect, useCallback, useRef } from "react";

// Basit geri sayım — saniye bazlı, "Tekrar gönder" kilidi için.
export function useCountdown(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [seconds > 0]);

  const reset = useCallback((next = initialSeconds) => setSeconds(next), [initialSeconds]);

  const label = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return { seconds, label, isDone: seconds <= 0, reset };
}
