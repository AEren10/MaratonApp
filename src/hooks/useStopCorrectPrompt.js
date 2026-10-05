import { useCallback, useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { canAskStopCorrect, recordStopCorrect } from "../lib/stopCompletionLog";
import { afterStopWrite } from "../lib/stopCorrectCoordination";

// Durak tiklenince "Kac dogru?" (istege bagli). Tik aninda yazilan kayda
// sonradan eklenir; gecilirse dogruluk null/bilinmiyor kalir (0 = olculmus sifir).
// Gunun son duragi sorulmaz: orada "gunu kapattin" ani acilir, iki pencere
// ust uste binmesin.
export function useStopCorrectPrompt(stops) {
  const { user } = useAuth();
  const [asking, setAsking] = useState(null);
  const pendingWrites = useRef(new Map());
  const { items, toggle } = stops;

  const toggleWithPrompt = useCallback((item) => {
    const wasDone = Boolean(item?.completed);
    const remaining = items.filter((t) => !t.completed).length;
    const write = Promise.resolve(toggle(item));
    pendingWrites.current.set(item.id, write);
    write.finally(() => {
      if (pendingWrites.current.get(item.id) === write) pendingWrites.current.delete(item.id);
    }).catch(() => {});
    if (!wasDone && remaining > 1 && canAskStopCorrect(item)) setAsking(item);
  }, [items, toggle]);

  const answer = useCallback((correct) => {
    const stop = asking;
    setAsking(null);
    if (stop && user?.id) {
      const write = pendingWrites.current.get(stop.id);
      afterStopWrite(write, () => recordStopCorrect(user.id, stop, correct)).catch(() => {});
    }
  }, [asking, user?.id]);

  const skip = useCallback(() => setAsking(null), []);

  return { asking, toggleWithPrompt, answer, skip };
}
