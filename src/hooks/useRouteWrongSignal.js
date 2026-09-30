import { useEffect, useMemo, useState } from "react";

import { getWrongQuestions } from "../supabase/wrongQuestions";
import { wrongSignalByTopic } from "../domain/route/wrongSignal";
import { onRouteUpdated } from "../lib/routeEvents";

// Rotanin yanlis defteri girdisi: cozulmemis yanlislar konu konu.
// tick degisince (rota guncellendi) yeniden okunur. Okuma basarisizsa rota
// yanlis sinyali olmadan kurulur -- rota bu yuzden durmamali.
// settled: ilk okuma bitti (hata dahil); rota kaydi bunu bekler, yoksa her
// acilista once yanlissiz sonra yanlisli iki revizyon yazilir.
export function useRouteWrongSignal(userId, tick = 0) {
  const [state, setState] = useState({ userId: null, rows: [], settled: false });
  // Yanlis eklenince/cozulunce aninda yeniden oku (rota yeni sinyalle kurulur).
  const [dataTick, setDataTick] = useState(0);
  useEffect(() => onRouteUpdated((payload) => {
    if (payload?.action === "data_changed" && payload.resource === "wrong_questions") setDataTick((t) => t + 1);
  }), []);
  useEffect(() => {
    if (!userId || userId === "dev" || userId === "local_user") {
      setState({ userId, rows: [], settled: true });
      return undefined;
    }
    let cancelled = false;
    // Kullanici degistiyse onceki kullanicinin satirlari hemen dusurulur.
    setState((prev) => (prev.userId === userId ? prev : { userId, rows: [], settled: false }));
    getWrongQuestions(userId, { resolved: false })
      .then((data) => { if (!cancelled) setState({ userId, rows: data || [], settled: true }); })
      .catch(() => { if (!cancelled) setState((prev) => ({ ...prev, userId, settled: true })); });
    return () => { cancelled = true; };
  }, [userId, tick, dataTick]);

  const rows = state.userId === userId ? state.rows : EMPTY_ROWS;
  const byTopic = useMemo(() => wrongSignalByTopic(rows), [rows]);
  // Rota onbellek anahtari: yalniz sayilar degisince rota yeniden kurulsun.
  const hash = useMemo(() => Object.entries(byTopic)
    .flatMap(([s, topics]) => Object.entries(topics).map(([t, v]) => `${s}/${t}:${v.open}/${v.due}`))
    .sort().join(","), [byTopic]);
  return { wrongsByTopic: byTopic, wrongsHash: hash, wrongsSettled: state.userId === userId && state.settled };
}

const EMPTY_ROWS = [];
