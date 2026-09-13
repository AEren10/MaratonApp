import { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { useGamification } from "./useGamification";
import {
  deleteWrongQuestion,
  getWrongQuestionById,
  resolveWrongQuestion,
  reviewWrongQuestion,
} from "../supabase/wrongQuestions";
import { trackButtonTap } from "../lib/analytics";
import * as H from "../lib/haptics";

// Yanlis Detayi (kendi sorun) veri + eylemleri.
// Girisler: { item } defterden, { question } aramadan, { id } derin baglantidan.
export function useWrongDetail(params = {}) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const showAlert = useAlert();
  const { reward } = useGamification();
  const passed = params.item || params.question || null;
  const linkedId = params.id || passed?.id;

  const [item, setItem] = useState(passed);
  const [loading, setLoading] = useState(!passed);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!linkedId || !user?.id) {
      setLoading(false);
      setFailed(!passed);
      return;
    }
    setLoading(true);
    try {
      const row = await getWrongQuestionById(linkedId, user.id);
      if (row) setItem(row);
      setFailed(!row && !passed);
    } catch {
      setFailed(!passed);
    } finally {
      setLoading(false);
    }
  }, [linkedId, user?.id, passed]);

  useEffect(() => {
    if (!passed) load();
  }, [passed, load]);

  const resolve = useCallback(async () => {
    if (busy || !item?.id || item.is_resolved) return;
    setBusy(true);
    try {
      await resolveWrongQuestion(item.id, user.id);
      H.success();
      trackButtonTap("wrong_resolve", { wrongQuestionId: item.id });
      reward("wrong_resolved", { statUpdates: [{ type: "increment", key: "wrongsResolved" }] });
      navigation.goBack();
    } catch (e) {
      showAlert("Hata", e?.message || "Kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  }, [busy, item, user?.id, reward, navigation, showAlert]);

  const remove = useCallback(() => {
    if (!item?.id) return;
    showAlert("Soruyu Sil", "Bu yanlış soruyu silmek istediğine emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteWrongQuestion(item.id, user.id);
            H.success();
            trackButtonTap("wrong_delete", { wrongQuestionId: item.id });
            navigation.goBack();
          } catch (e) {
            showAlert("Hata", e?.message || "Kaydedilemedi.");
          }
        },
      },
    ]);
  }, [item?.id, user?.id, navigation, showAlert]);

  const saveNote = useCallback(async (text) => {
    if (!item?.id) return false;
    const note = text.trim() || null;
    try {
      await reviewWrongQuestion(item.id, user.id, { note });
      setItem((prev) => ({ ...prev, note }));
      trackButtonTap("wrong_note_edit", { wrongQuestionId: item.id });
      return true;
    } catch (e) {
      showAlert("Hata", e?.message || "Kaydedilemedi.");
      return false;
    }
  }, [item?.id, user?.id, showAlert]);

  return { busy, failed, item, load, loading, remove, resolve, saveNote };
}
