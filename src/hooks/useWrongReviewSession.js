import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { SCREENS } from "../constants/screens";
import { useAuth } from "../contexts/AuthContext";
import { useGamification } from "./useGamification";
import { getDueWrongQuestions } from "../supabase/wrongQuestions";
import { saveReviewOffline } from "../lib/offlineQueue";
import { gradeWrongReview } from "../lib/wrongReviewLadder";
import { trackButtonTap } from "../lib/analytics";
import * as H from "../lib/haptics";

// Sonuc goruldukten sonra siradaki soruya gecis. Kullanici ipucu satirini
// okuyabilsin diye animasyon suresinden uzun.
const ADVANCE_MS = 1400;

function shuffled(rows) {
  const a = [...rows];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// "Tekrar" seansi. Eski Klasik Tekrar, Kart Tekrari ve Hizli Pratik bu tek
// akista birlesti; fark yalniz secim: { limit, shuffle } parametreleri.
export function useWrongReviewSession({ limit, shuffle, source } = {}) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { reward } = useGamification();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [queue, setQueue] = useState([]);
  const [pendingStart, setPendingStart] = useState(0);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [stats, setStats] = useState({ remembered: 0, forgot: 0, closed: 0, queued: 0 });
  const timer = useRef(null);
  const statsRef = useRef(stats);
  statsRef.current = stats;

  const load = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const rows = await getDueWrongQuestions(user.id);
      const picked = shuffle ? shuffled(rows) : rows;
      setQueue(limit ? picked.slice(0, limit) : picked);
      setPendingStart(rows.length);
      setFailed(false);
      trackButtonTap("wrong_review_session_open", { source: source || "direct", due: rows.length });
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id, limit, shuffle, source]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const current = queue[idx] || null;

  const finish = useCallback(() => {
    const s = statsRef.current;
    const reviewed = s.remembered + s.forgot;
    navigation.replace(SCREENS.REVIEW_DONE, {
      reviewedCount: reviewed,
      rememberedCount: s.remembered,
      forgotCount: s.forgot,
      closedCount: s.closed,
      pendingBefore: pendingStart,
      pendingAfter: Math.max(0, pendingStart - s.remembered),
      queuedCount: s.queued,
    });
  }, [navigation, pendingStart]);

  const grade = useCallback((knew) => {
    if (!current || answer || !user?.id) return;
    const result = gradeWrongReview(current, knew);
    if (knew) H.success(); else H.tap();
    saveReviewOffline(current.id, user.id, result.updates)
      .then((r) => { if (r.queued) setStats((p) => ({ ...p, queued: p.queued + 1 })); })
      .catch(() => {});
    if (result.closes) {
      reward("wrong_resolved", { statUpdates: [{ type: "increment", key: "wrongsResolved" }] });
    }
    setStats((p) => ({
      ...p,
      remembered: p.remembered + (knew ? 1 : 0),
      forgot: p.forgot + (knew ? 0 : 1),
      closed: p.closed + (result.closes ? 1 : 0),
    }));
    setAnswer({ knew, ...result });

    const last = idx + 1 >= queue.length;
    timer.current = setTimeout(() => {
      if (last) {
        finish();
        return;
      }
      setAnswer(null);
      setIdx((i) => i + 1);
    }, ADVANCE_MS);
  }, [current, answer, user?.id, reward, idx, queue.length, finish]);

  return {
    answer,
    current,
    failed,
    grade,
    idx,
    load,
    loading,
    pendingNow: Math.max(0, pendingStart - stats.remembered),
    pendingStart,
    total: queue.length,
  };
}
