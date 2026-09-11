import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useC } from "../../contexts/ThemeContext";
import { useAlert } from "../../contexts/AlertContext";
import { useExam } from "../../contexts/ExamContext";
import { useShareCards } from "../../hooks/useShareCards";
import { Icon, Button, ErrorState, Skeleton, EmptyState } from "../../components/design";
import { ShareStoryCard } from "./components/ShareStoryCard";
import { ShareModeChips } from "./components/ShareModeChips";
import { TYPOGRAPHY, STEP, CONTROL } from "../../themes/tokens";
import * as H from "../../lib/haptics";

export default function ShareCardScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const nav = useNavigation();
  const { params } = useRoute();
  const showAlert = useAlert();
  const { daysUntilExam } = useExam();
  const { cards, loading, error } = useShareCards();

  const [selectedId, setSelectedId] = useState(params?.cardId || null);
  useEffect(() => {
    if (!selectedId && cards.length > 0) setSelectedId(cards[0].id);
  }, [cards, selectedId]);

  const activeCard = cards.find((c) => c.id === selectedId) || cards[0] || null;
  const footRight = daysUntilExam != null ? `SINAVA ${daysUntilExam} GÜN` : null;
  const cardRef = useRef(null);

  const handleShare = useCallback(async () => {
    let captureRef, Sharing;
    try {
      ({ captureRef } = require("react-native-view-shot"));
      Sharing = require("expo-sharing");
    } catch {
      showAlert("Paylaşım kullanılamıyor");
      return;
    }
    try {
      H.tap();
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      if (!(await Sharing.isAvailableAsync())) { showAlert("Paylaşım yok"); return; }
      await Sharing.shareAsync(`file://${uri}`, { mimeType: "image/png", dialogTitle: "Kartını paylaş" });
      H.success();
    } catch {
      showAlert("Hata", "Kart oluşturulamadı.");
    }
  }, [showAlert]);

  // "Galeriye kaydet" YAZILMADI: expo-media-library package.json'da yok,
  // yani buton her basista "kullanilamiyor" derdi. Calismayan bir kontrol
  // gostermek olmayan veriyi gostermekle ayni sey. Paket eklenince buraya
  // gelir; paylasim (expo-sharing + view-shot) gercekten calisiyor.

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12} style={s.closeBtn}>
          <Icon name="x" size={16} color={C.text2} />
        </Pressable>
        <Text style={s.title}>Paylaş</Text>
        <View style={{ width: CONTROL.tapMin }} />
      </View>

      {loading ? (
        <View style={s.center}>
          <Skeleton width={280} height={420} radius={20} />
        </View>
      ) : error ? (
        <View style={s.center}>
          <ErrorState preset="server" onPrimary={() => nav.goBack()} />
        </View>
      ) : !activeCard ? (
        <EmptyState
          preset="shareCards"
          onPrimary={() => nav.goBack()}
          style={s.center}
        />
      ) : (
        <>
          <View style={s.center}>
            <View style={s.cardWrap}>
              <ShareStoryCard ref={cardRef} card={activeCard} footRight={footRight} />
            </View>
          </View>

          <ShareModeChips cards={cards} selectedId={activeCard.id} onSelect={setSelectedId} />

          <View style={s.actions}>
            <Button onPress={handleShare} icon="share" fullWidth size="lg">
              Paylaş
            </Button>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (C) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: STEP.s3, paddingVertical: STEP.s1,
  },
  closeBtn: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  title: { ...TYPOGRAPHY.subheading, color: C.text },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardWrap: { width: 280 },
  actions: { paddingHorizontal: STEP.s4, paddingBottom: STEP.s4, paddingTop: STEP.s2 },
  saveRow: { alignItems: "center", justifyContent: "center", minHeight: CONTROL.tapMin },
});
