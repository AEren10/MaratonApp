import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useGamification } from "../../hooks/useGamification";
import { trackButtonTap } from "../../lib/analytics";
import * as haptic from "../../lib/haptics";
import { SCREENS } from "../../constants/screens";
import {
  WRONG_NOTEBOOK_STATUS,
  WRONG_NOTEBOOK_TAB,
  buildWrongNotebookViewModel,
  getWrongSubjectKey,
} from "../../domain/wrongNotebook/wrongNotebookModel";
import { getWrongQuestions, resolveWrongQuestion, deleteWrongQuestion } from "../../supabase/wrongQuestions";
import { getPendingWrongQuestions, removeFromQueue } from "../../lib/offlineQueue";
import { shareQuestion, getSharedQuestionIds } from "../../supabase/community";

export function useWrongNotebookController() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { reward, xpToast, dismissXP } = useGamification();
  const showAlert = useAlert();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState([]);
  const [subject, setSubject] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [status, setStatus] = useState(WRONG_NOTEBOOK_STATUS.OPEN);
  const [mainTab, setMainTab] = useState(WRONG_NOTEBOOK_TAB.COMMUNITY);
  const [sharedIds, setSharedIds] = useState(new Set());
  const [shareModal, setShareModal] = useState({ visible: false, item: null });
  const [errorModal, setErrorModal] = useState({ visible: false, message: "" });

  const viewModel = useMemo(
    () => buildWrongNotebookViewModel({ items, status, subject, topicFilter }),
    [items, status, subject, topicFilter],
  );

  const loadItems = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await getWrongQuestions(user.id);
      // Kuyrukta bekleyenler de listede dursun; yoksa çevrimdışı eklenen soru
      // "kaydedildi" denip ilk tazelemede kayboluyor.
      const queued = await getPendingWrongQuestions(user.id).catch(() => []);
      const seen = new Set((data || []).map((d) => d.client_operation_id).filter(Boolean));
      const pendingItems = queued.filter((q) => !q.client_operation_id || !seen.has(q.client_operation_id));
      const merged = [...pendingItems, ...(data || [])];
      setItems(merged);
      const ids = await getSharedQuestionIds((data || []).map((item) => item.id));
      setSharedIds(ids);
    } catch (error) {
      setErrorModal({ visible: true, message: error?.message || "Yanlış defteri yüklenemedi." });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => {
    loadItems();
  }, [loadItems]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  }, [loadItems]);

  const setSubjectAndReset = useCallback((nextSubject) => {
    haptic.select();
    trackButtonTap("wrong_filter_subject", { subject: nextSubject });
    setSubject(nextSubject);
    setTopicFilter("all");
  }, []);

  const setStatusFilter = useCallback((nextStatus) => {
    haptic.select();
    trackButtonTap("wrong_filter_status", { status: nextStatus });
    setStatus(nextStatus);
  }, []);

  const setTopic = useCallback((nextTopic) => {
    haptic.select();
    trackButtonTap("wrong_filter_topic", { topic: nextTopic });
    setTopicFilter(nextTopic);
  }, []);

  const setTab = useCallback((nextTab) => {
    haptic.select();
    trackButtonTap("wrong_tab_switch", { tab: nextTab });
    setMainTab(nextTab);
  }, []);

  const handleShare = useCallback((item) => {
    trackButtonTap("wrong_share_open", { wrongQuestionId: item.id });
    setShareModal({ visible: true, item });
  }, []);

  const closeShareModal = useCallback(() => {
    setShareModal({ visible: false, item: null });
  }, []);

  const closeErrorModal = useCallback(() => {
    setErrorModal({ visible: false, message: "" });
  }, []);

  const doShare = useCallback(async (item, anonymous) => {
    if (!item || !user?.id) return;
    if (item.pending) {
      setErrorModal({ visible: true, message: "Bu soru henüz gönderilmedi. Bağlantı gelince paylaşabilirsin." });
      return;
    }
    try {
      await shareQuestion({
        wrongQuestionId: item.id,
        userId: user.id,
        subject: getWrongSubjectKey(item),
        topic: item.topic,
        imagePath: item.image_path,
        note: item.note,
        isAnonymous: anonymous,
      });
      haptic.success();
      trackButtonTap("wrong_share_submit", { anonymous, wrongQuestionId: item.id });
      setSharedIds((prev) => new Set([...prev, item.id]));
      setMainTab(WRONG_NOTEBOOK_TAB.COMMUNITY);
      closeShareModal();
    } catch (error) {
      setErrorModal({ visible: true, message: error?.message || "Paylaşılamadı" });
    }
  }, [closeShareModal, user?.id]);

  // Kuyrukta bekleyen kayıtların sunucu tarafında satırı yok; id'leri sahte.
  // Onlara resolve/paylaş uygulanamaz, silme ise kuyruktan çıkarma demektir.
  const isPendingId = useCallback(
    (id) => items.some((entry) => entry.id === id && entry.pending),
    [items],
  );

  const toggleResolve = useCallback(async (id) => {
    if (!user?.id) return;
    if (isPendingId(id)) {
      setErrorModal({ visible: true, message: "Bu soru henüz gönderilmedi. Bağlantı gelince işaretleyebilirsin." });
      return;
    }
    setItems((prev) => {
      const item = prev.find((entry) => entry.id === id);
      if (!item || item.is_resolved) return prev;
      return prev.map((entry) => (entry.id === id ? { ...entry, is_resolved: true } : entry));
    });
    haptic.success();
    reward("wrong_resolved", { statUpdates: [{ type: "increment", key: "wrongsResolved" }] });
    trackButtonTap("wrong_resolve", { wrongQuestionId: id });
    try {
      await resolveWrongQuestion(id, user.id);
    } catch {
      setItems((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, is_resolved: false } : entry)),
      );
    }
  }, [reward, user?.id, isPendingId]);

  const handleCardPress = useCallback((item) => {
    if (item?.pending) {
      // Detay ekranı sunucudan çekiyor; henüz gönderilmemiş kayıt boş görünürdü.
      setErrorModal({ visible: true, message: "Bu soru gönderilmeyi bekliyor. Bağlantı gelince açabilirsin." });
      return;
    }
    trackButtonTap("wrong_card_open", { wrongQuestionId: item.id });
    navigation.navigate(SCREENS.WRONG_DETAIL, { id: item.id, item });
  }, [navigation]);

  const handleDelete = useCallback((id) => {
    if (!user?.id) return;
    const pending = isPendingId(id);
    showAlert("Soruyu Sil", "Bu yanlış soruyu silmek istediğine emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          setItems((prev) => prev.filter((item) => item.id !== id));
          haptic.success();
          trackButtonTap("wrong_delete", { wrongQuestionId: id });
          try {
            if (pending) await removeFromQueue(id);
            else await deleteWrongQuestion(id, user.id);
          } catch {
            loadItems();
          }
        },
      },
    ]);
  }, [loadItems, showAlert, user?.id, isPendingId]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const goAddWrong = useCallback(() => {
    trackButtonTap("wrong_add_open", { targetScreen: SCREENS.ADD_WRONG });
    navigation.navigate(SCREENS.ADD_WRONG);
  }, [navigation]);
  const goClassicReview = useCallback(() => navigation.navigate(SCREENS.REVIEW_SESSION), [navigation]);
  const goSwipeReview = useCallback(() => navigation.navigate(SCREENS.SWIPE_REVIEW), [navigation]);

  return {
    closeErrorModal,
    closeShareModal,
    dismissXP,
    doShare,
    errorModal,
    goAddWrong,
    goBack,
    goClassicReview,
    goSwipeReview,
    handleCardPress,
    handleDelete,
    handleShare,
    loading,
    mainTab,
    onRefresh,
    refreshing,
    setStatusFilter,
    setSubjectAndReset,
    setTab,
    setTopic,
    shareModal,
    sharedIds,
    status,
    subject,
    topicFilter,
    toggleResolve,
    viewModel,
    xpToast,
  };
}
