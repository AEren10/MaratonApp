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

  // Galeriye kaydet. expo-media-library kuruldu (SDK 54: ~18.2.1) ve
  // app.json'a savePhotosPermission ile eklendi, yani buton gercekten
  // calisiyor. Yalniz KAYDETME izni isteniyor ("writeOnly"): kullanicinin
  // tum galerisini okumaya gerek yok, kart yazmak yeterli.
  const handleSaveGallery = useCallback(async () => {
    try {
      const { captureRef } = require("react-native-view-shot");
      const MediaLibrary = require("expo-media-library");

      const perm = await MediaLibrary.requestPermissionsAsync(true);
      if (!perm.granted) {
        H.warn();
        showAlert("Galeri izni gerekiyor", "Kartı kaydetmek için izin vermen gerekiyor.");
        return;
      }
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      await MediaLibrary.saveToLibraryAsync(uri);
      H.success();
      showAlert("Kaydedildi", "Kart galerine kaydedildi.");
    } catch {
      H.warn();
      showAlert("Hata", "Kart kaydedilemedi.");
    }
  }, [showAlert]);

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
            <Pressable
              onPress={handleSaveGallery}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Kartı galerine kaydet"
              style={({ pressed }) => [s.saveRow, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>
                Galeriye kaydet
              </Text>
            </Pressable>
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
