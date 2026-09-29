import { useEffect, useMemo, useState } from "react";

import { getWrongQuestions } from "../supabase/wrongQuestions";
import { wrongSignalByTopic } from "../domain/route/wrongSignal";

// Rotanin yanlis defteri girdisi: cozulmemis yanlislar konu konu.
// tick degisince (rota guncellendi) yeniden okunur. Okuma basarisizsa rota
// yanlis sinyali olmadan kurulur -- rota bu yuzden durmamali.
export function useRouteWrongSignal(userId, tick = 0) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    if (!userId || userId === "dev" || userId === "local_user") return undefined;
    let cancelled = false;
    getWrongQuestions(userId, { resolved: false })
      .then((data) => { if (!cancelled) setRows(data || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userId, tick]);

  const byTopic = useMemo(() => wrongSignalByTopic(rows), [rows]);
  // Rota onbellek anahtari: yalniz sayilar degisince rota yeniden kurulsun.
  const hash = useMemo(() => Object.entries(byTopic)
    .flatMap(([s, topics]) => Object.entries(topics).map(([t, v]) => `${s}/${t}:${v.open}/${v.due}`))
    .sort().join(","), [byTopic]);
  return { wrongsByTopic: byTopic, wrongsHash: hash };
}
