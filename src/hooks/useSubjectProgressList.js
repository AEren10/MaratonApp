import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useSync } from "../contexts/DataSyncContext";
import { useStudyRoute } from "./useStudyRoute";
import { getTopicProgress } from "../supabase/topicProgress";
import { getWrongQuestions } from "../supabase/wrongQuestions";
import { captureError } from "../lib/errorReporting";
import { buildSubjectProgressList, SUBJECT_PROGRESS_TAB } from "../domain/analysis/subjectProgressList";
import { subjectColorOf } from "../themes/subjectPalette";
import { useC } from "../contexts/ThemeContext";

export { SUBJECT_PROGRESS_TAB };

function flattenStops(route) {
  const out = [];
  (route?.weeks || []).forEach((week, weekIndex) => {
    (week.stops || []).forEach((stop) => {
      if (!stop?.topic) return;
      out.push({
        topic: stop.topic,
        subject: stop.subject,
        subjectLabel: stop.subjectLabel,
        lifecycleStatus: stop.lifecycleStatus,
        weekIndex,
      });
    });
  });
  return out;
}

/**
 * KONU ILERLEMESI listesi — sekme basina gercek veriden siniflandirma.
 * Ilerleme `topic_progress`, durak durumu rotadan, defter yuku yanlis
 * defterinden gelir. Hicbiri yoksa alan atlanir, uydurulmaz.
 */
export function useSubjectProgressList(tab) {
  const C = useC();
  const { user } = useAuth();
  const { syncedOnce } = useSync();
  const { route, routeStopsLoaded } = useStudyRoute();
  const [progressRows, setProgressRows] = useState([]);
  const [notebookItems, setNotebookItems] = useState([]);
  const [localLoaded, setLocalLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id || user.id === "dev") {
      setLocalLoaded(true);
      return;
    }
    try {
      const [rows, wrongs] = await Promise.all([
        getTopicProgress(user.id).catch(() => []),
        getWrongQuestions(user.id).catch(() => []),
      ]);
      setProgressRows(rows || []);
      setNotebookItems(wrongs || []);
    } catch (e) {
      captureError(e, { context: "useSubjectProgressList_load" });
    } finally {
      setLocalLoaded(true);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const routeStops = useMemo(() => flattenStops(route), [route]);

  const items = useMemo(() => buildSubjectProgressList({
    progressRows,
    routeStops,
    notebookItems,
    tab,
  }).map((item) => ({
    ...item,
    color: subjectColorOf(C, item.subjectKey),
    badgeColor: item.notebookCount > 0 ? C.warn : C.text3,
    barColor: C.accent,
  })), [C, progressRows, routeStops, notebookItems, tab]);

  const loading = !localLoaded || !syncedOnce || !routeStopsLoaded;

  return { items, loading, isEmpty: !loading && items.length === 0, refresh: load };
}
