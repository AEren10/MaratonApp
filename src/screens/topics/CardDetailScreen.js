import { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { FlashcardItem } from "./components/FlashcardItem";

function CardDetailContent() {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const route = useRoute();
  const flashcards = route.params?.flashcards || [];

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(new Set());

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  if (flashcards.length === 0) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
            <Icon name="arrowL" size={22} color={C.text} />
          </Pressable>
          <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: STEP.s2 }]}>
            Kart Detay
          </Text>
        </View>
        <View style={styles.empty}>
          <Icon name="bookOpen" size={48} color={C.text3} />
          <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s3, textAlign: "center" }]}>
            Bu konu için henüz flashcard bulunmuyor.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const card = flashcards[index];
  const total = flashcards.length;
  const cardTitle = route.params?.title || "Kart Detay";

  const flip = () => setFlipped((p) => !p);

  const next = (isKnown) => {
    if (isKnown && card?.id) setKnown((prev) => new Set(prev).add(card.id));
    setFlipped(false);
    if (index < total - 1) setIndex((p) => p + 1);
  };

  const prev = () => {
    if (index > 0) {
      setFlipped(false);
      setIndex((p) => p - 1);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: STEP.s2 }]}>
          {cardTitle}
        </Text>
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>
          {index + 1}/{total}
        </Text>
      </View>

      <View style={styles.progressRow}>
        {flashcards.map((c, i) => (
          <View
            key={c.id || String(i)}
            style={[
              styles.progressDot,
              i === index && { backgroundColor: C.accent },
              known.has(c.id) && { backgroundColor: C.up },
            ]}
          />
        ))}
      </View>

      <View style={styles.center}>
        <FlashcardItem card={card} flipped={flipped} onFlip={flip} C={C} />
      </View>

      <View style={styles.actions}>
        <Pressable onPress={prev} style={[styles.navBtn, index === 0 && { opacity: 0.3 }]}>
          <Icon name="arrowL" size={20} color={C.text} />
        </Pressable>

        <Pressable onPress={() => next(false)} style={[styles.actionBtn, { backgroundColor: C.danger + "20" }]}>
          <Icon name="x" size={20} color={C.danger} />
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.danger }]}>Tekrar et</Text>
        </Pressable>

        <Pressable onPress={() => next(true)} style={[styles.actionBtn, { backgroundColor: C.up + "20" }]}>
          <Icon name="check" size={20} color={C.up} />
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.up }]}>Bildim</Text>
        </Pressable>

        <Pressable onPress={() => next(false)} style={[styles.navBtn, index === total - 1 && { opacity: 0.3 }]}>
          <Icon name="arrowR" size={20} color={C.text} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function CardDetailScreen() {
  return (
    <ScreenErrorBoundary screenName="CardDetailScreen">
      <CardDetailContent />
    </ScreenErrorBoundary>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: GUTTER, paddingVertical: STEP.s2,
    },
    empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: STEP.s5 },
    progressRow: {
      flexDirection: "row", justifyContent: "center", gap: 6,
      paddingHorizontal: GUTTER, marginTop: STEP.s1,
    },
    progressDot: {
      flex: 1, height: 4, borderRadius: 2, backgroundColor: C.surface, maxWidth: 60,
    },
    center: { flex: 1, justifyContent: "center", alignItems: "center", padding: GUTTER },
    actions: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: STEP.s2, paddingHorizontal: GUTTER, paddingBottom: STEP.s4,
    },
    navBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: C.surface, alignItems: "center", justifyContent: "center",
    },
    actionBtn: {
      flexDirection: "row", alignItems: "center", gap: 6,
      borderRadius: SHAPE.pill, paddingHorizontal: STEP.s3, paddingVertical: STEP.s2,
    },
  });
}
