import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { trackButtonTap } from "../../lib/analytics";
import { SCREENS } from "../../constants/screens";
import { buildNotebookView, NOTEBOOK_FILTER } from "../../domain/wrongNotebook/wrongTopicGroups";
import { getWrongQuestions } from "../../supabase/wrongQuestions";
import {
  getPendingWrongQuestions,
  getDeadLetterItems,
  retryDeadLetter,
  OP_WRONG_QUESTION,
} from "../../lib/offlineQueue";

// Defter ekraninin veri + gezinme mantigi. Topluluk sekmesi v1 disi oldugu
// icin paylasim durumu artik burada yuklenmiyor; silme ve kapatma Yanlis
// Detayi'na tasindi (tasarimda liste satirinda aksiyon yok).
export function useWrongNotebookController() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const showAlert = useAlert();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState(NOTEBOOK_FILTER.OPEN);
  // image_local_uri OS onbellegine isaret eder; onbellek temizlenince kayit
  // dead-letter'a duser ve fotograf sessizce kaybolur. Kullaniciya gosterilir.
  const [lostPhotoCount, setLostPhotoCount] = useState(0);

  const view = useMemo(() => buildNotebookView(items, filter), [items, filter]);

  const loadItems = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await getWrongQuestions(user.id);
      // Kuyrukta bekleyenler de listede dursun; yoksa cevrimdisi eklenen soru
      // "kaydedildi" denip ilk tazelemede kayboluyor.
      const queued = await getPendingWrongQuestions(user.id).catch(() => []);
      const seen = new Set((data || []).map((d) => d.client_operation_id).filter(Boolean));
      const pendingItems = queued.filter((q) => !q.client_operation_id || !seen.has(q.client_operation_id));
      setItems([...pendingItems, ...(data || [])]);
      setLoadFailed(false);

      const dead = await getDeadLetterItems().catch(() => []);
      setLostPhotoCount(dead.filter(
        (d) => d.type === OP_WRONG_QUESTION && d.payload?.image_local_uri && !d.payload?.image_path,
      ).length);
    } catch {
      setLoadFailed(true);
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

  const retry = useCallback(() => {
    setLoading(true);
    loadItems();
  }, [loadItems]);

  const changeFilter = useCallback((next) => {
    trackButtonTap("wrong_filter_status", { status: next });
    setFilter(next);
  }, []);

  const openGroup = useCallback((group) => {
    const item = group?.lead;
    if (!item) return;
    if (item.pending) {
      // Detay ekrani sunucudan cekiyor; henuz gonderilmemis kayit bos gorunurdu.
      showAlert("Bu soru gönderilmeyi bekliyor.", "Bağlantı gelince açabilirsin.");
      return;
    }
    trackButtonTap("wrong_card_open", { wrongQuestionId: item.id });
    navigation.navigate(SCREENS.WRONG_DETAIL, { id: item.id, item });
  }, [navigation, showAlert]);

  const dismissLostPhotos = useCallback(async () => {
    trackButtonTap("wrong_lost_photo_retry");
    await retryDeadLetter().catch(() => {});
    setLostPhotoCount(0);
    loadItems();
  }, [loadItems]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const goAddWrong = useCallback(() => {
    trackButtonTap("wrong_add_open", { targetScreen: SCREENS.ADD_WRONG });
    navigation.navigate(SCREENS.ADD_WRONG);
  }, [navigation]);
  const goReview = useCallback(() => {
    trackButtonTap("wrong_review_start", { targetScreen: SCREENS.REVIEW_SESSION });
    navigation.navigate(SCREENS.REVIEW_SESSION, { source: "notebook" });
  }, [navigation]);

  return {
    changeFilter,
    dismissLostPhotos,
    filter,
    goAddWrong,
    goBack,
    goReview,
    loadFailed,
    loading,
    lostPhotoCount,
    onRefresh,
    openGroup,
    refreshing,
    retry,
    view,
  };
}
