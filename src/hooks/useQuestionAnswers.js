import { useCallback, useEffect, useRef, useState } from "react";
import { getAnswers, postAnswer, subscribeToAnswers } from "../supabase/community";
import { useAuth } from "../contexts/AuthContext";

/**
 * Topluluk soru-cevap veri katmanı.
 *
 * getAnswers / postAnswer / subscribeToAnswers zaten yazılıydı ama HİÇBİR
 * ekran çağırmıyordu: soru paylaşımı çalışıyor, cevap yazma arayüzü yoktu.
 * Mantık burada — ekran sadece gösterir.
 *
 * Realtime abonelik açık: başkası cevap yazdığında liste kendi kendine
 * güncelleniyor.
 */
export function useQuestionAnswers(sharedQuestionId) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const activeIdRef = useRef(sharedQuestionId);
  activeIdRef.current = sharedQuestionId;

  const load = useCallback(async () => {
    if (!sharedQuestionId) { setLoading(false); return; }
    try {
      const rows = await getAnswers(sharedQuestionId);
      // Soru değiştiyse eski cevabı yazma.
      if (activeIdRef.current !== sharedQuestionId) return;
      setAnswers(rows || []);
      setError(null);
    } catch (e) {
      if (activeIdRef.current === sharedQuestionId) setError(e);
    } finally {
      if (activeIdRef.current === sharedQuestionId) setLoading(false);
    }
  }, [sharedQuestionId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Realtime: başkasının cevabı anında düşsün.
  useEffect(() => {
    if (!sharedQuestionId) return;
    let unsub;
    try {
      unsub = subscribeToAnswers(sharedQuestionId, () => load());
    } catch (_) {}
    return () => {
      try { unsub?.(); } catch (_) {}
    };
  }, [sharedQuestionId, load]);

  const submit = useCallback(async ({ text, imageUri, isAnonymous = true }) => {
    const body = (text || "").trim();
    if (!body && !imageUri) return { ok: false, reason: "empty" };
    if (!user?.id || user.id === "dev") return { ok: false, reason: "auth" };
    if (posting) return { ok: false, reason: "busy" };

    setPosting(true);
    try {
      await postAnswer({
        sharedQuestionId,
        userId: user.id,
        text: body,
        imageUri,
        isAnonymous,
      });
      await load();
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: "network", error: e };
    } finally {
      setPosting(false);
    }
  }, [sharedQuestionId, user?.id, posting, load]);

  return { answers, loading, posting, error, submit, reload: load };
}
