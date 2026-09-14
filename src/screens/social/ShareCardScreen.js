import { useMemo, useRef, useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { useShareCards } from "../../hooks/useShareCards";
import { useShareCardActions } from "../../hooks/useShareCardActions";
import PillTabs from "../../components/common/PillTabs";
import { SHARE_MODES, SHARE_MODE_OPTIONS, cardMode, cardsForMode } from "../../domain/share/shareCardModes";
import { Icon, Button, ErrorState, Skeleton, EmptyState } from "../../components/design";
import { ShareStoryCard } from "./components/ShareStoryCard";
import { ShareModeChips } from "./components/ShareModeChips";
import { TYPOGRAPHY, STEP, CONTROL } from "../../themes/tokens";

export default function ShareCardScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const nav = useNavigation();
  const { params } = useRoute();
  const { daysUntilExam } = useExam();
  const { cards, loading, error } = useShareCards();

  const [mode, setMode] = useState(() => (params?.cardId ? cardMode({ id: params.cardId }) : SHARE_MODES.EMEK));
  const modeCards = useMemo(() => cardsForMode(cards, mode), [cards, mode]);
  const [selectedId, setSelectedId] = useState(params?.cardId || null);
  useEffect(() => {
    if (modeCards.length > 0 && !modeCards.some((c) => c.id === selectedId)) setSelectedId(modeCards[0].id);
  }, [modeCards, selectedId]);

  const activeCard = modeCards.find((c) => c.id === selectedId) || modeCards[0] || null;
  const footRight = daysUntilExam != null ? `SINAVA ${daysUntilExam} GÜN` : null;
  const cardRef = useRef(null);
  const shareMeta = useMemo(
    () => () => ({ cardId: activeCard?.id || null, mode }),
    [activeCard?.id, mode],
  );
  const { handleShare, handleSaveGallery } = useShareCardActions(cardRef, shareMeta);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12} style={s.closeBtn}>
          <Icon name="x" size={16} color={C.text2} />
        </Pressable>
        <Text style={s.title}>Paylaş</Text>
        <View style={{ width: CONTROL.tapMin }} />
      </View>
      <View style={s.modes}>
        <PillTabs options={SHARE_MODE_OPTIONS} value={mode} onChange={setMode} height={42} />
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

          <ShareModeChips cards={modeCards} selectedId={activeCard.id} onSelect={setSelectedId} />

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
  modes: { paddingHorizontal: STEP.s3, paddingTop: STEP.s1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardWrap: { width: 280 },
  actions: { paddingHorizontal: STEP.s4, paddingBottom: STEP.s4, paddingTop: STEP.s2 },
  saveRow: { alignItems: "center", justifyContent: "center", minHeight: CONTROL.tapMin },
});
