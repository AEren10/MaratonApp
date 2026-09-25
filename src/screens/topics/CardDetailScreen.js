import { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { FlashcardItem } from "./components/FlashcardItem";
import { FlashcardActions } from "./components/FlashcardActions";
import { Press } from "../../components/design/Press";

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
          <Press haptic="none" onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
            <Icon name="arrowL" size={22} color={C.text} />
          </Press>
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
        <Press haptic="none" onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={22} color={C.text} />
        </Press>
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

      <FlashcardActions
        onPrev={prev}
        onNext={next}
        isFirst={index === 0}
        isLast={index === total - 1}
        C={C}
      />
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
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: GUTTER,
      paddingVertical: STEP.s2,
    },
    empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: STEP.s5 },
    progressRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: STEP.s1,
      paddingHorizontal: GUTTER,
      marginTop: STEP.s1,
    },
    progressDot: {
      flex: 1,
      height: 4,
      borderRadius: SHAPE.chip / 4,
      backgroundColor: C.surface,
      maxWidth: 60,
    },
    center: { flex: 1, justifyContent: "center", alignItems: "center", padding: GUTTER },
  });
}
