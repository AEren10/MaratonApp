import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import { getStudyLogs } from "../../supabase/studyLogs";
import { useStudyLogMutations } from "../../hooks/useStudyLogMutations";
import { buildStudyHistory } from "../../domain/study/studyHistoryModel";
import { SCREENS } from "../../constants/screens";
import * as H from "../../lib/haptics";

// Tum kayitlar sayfalanarak okunur; TOPLAM ve KAYIT ilk 500 satirla sinirli kalmasin.
const ALL_TIME = "2000-01-01";

export function useStudyHistoryController() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { confirmDelete } = useStudyLogMutations();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);
  const loadedOnce = useRef(false);

  const load = useCallback(async (mode = "load") => {
    if (!user?.id || user.id === "dev") { setLoading(false); return; }
    if (mode === "refresh") setRefreshing(true);
    else if (!loadedOnce.current) setLoading(true);
    try {
      const data = await getStudyLogs(user.id, { from: ALL_TIME });
      setLogs(data || []);
      setFailed(false);
      loadedOnce.current = true;
    } catch (_) {
      setFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const history = useMemo(() => buildStudyHistory(logs), [logs]);

  const openLog = useCallback((log) => {
    H.tap();
    navigation.navigate(SCREENS.EDIT_STUDY_LOG, { log });
  }, [navigation]);

  const deleteLog = useCallback((log) => {
    confirmDelete(log, {
      onOptimistic: (l) => setLogs((prev) => prev.filter((x) => x.id !== l.id)),
      onRollback: () => load(),
    });
  }, [confirmDelete, load]);

  return {
    history,
    loading,
    refreshing,
    failed,
    isEmpty: !loading && !failed && logs.length === 0,
    retry: () => load(),
    onRefresh: () => load("refresh"),
    openLog,
    deleteLog,
    goBack: () => navigation.goBack(),
    startTimer: () => navigation.navigate(SCREENS.STUDY_TIMER),
    addManual: () => navigation.navigate(SCREENS.ADD_STUDY),
  };
}
