import { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";

const { width: SW } = Dimensions.get("window");
const CARD_W = SW - SPACING.lg * 2;

function Flashcard({ card, flipped, onFlip }) {
  return (
    <Pressable onPress={onFlip} style={styles.flashcard}>
      <View style={styles.cardLabel}>
        <Icon name={flipped ? "eye" : "eyeOff"} size={14} color={C.muted} />
        <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>
          {flipped ? "CEVAP" : "SORU"}
        </Text>
      </View>
      <Text style={[
        flipped ? TYPOGRAPHY.body : TYPOGRAPHY.subheading,
        { color: C.text, textAlign: "center" },
      ]}>
        {flipped ? card.back : card.front}
      </Text>
      <Text style={[TYPOGRAPHY.micro, { color: C.muted, marginTop: SPACING.lg }]}>
        Cevirmek icin dokun
      </Text>
    </Pressable>
  );
}

export default function CardDetailScreen() {
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
          <Pressable onPress={goBack} hitSlop={12}>
            <Icon name="arrowL" size={22} color={C.text} />
          </Pressable>
          <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>
            Kart Detay
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: SPACING.xxxl }}>
          <Icon name="bookOpen" size={48} color={C.muted} />
          <Text style={[TYPOGRAPHY.body, { color: C.muted, marginTop: SPACING.lg, textAlign: "center" }]}>
            Bu konu icin henuz flashcard bulunmuyor.
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
    if (isKnown) setKnown((prev) => new Set(prev).add(card.id));
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
        <Pressable onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>
          {cardTitle}
        </Text>
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.sec }]}>
          {index + 1}/{total}
        </Text>
      </View>

      <View style={styles.progressRow}>
        {flashcards.map((c, i) => (
          <View
            key={c.id || String(i)}
            style={[
              styles.progressDot,
              i === index && styles.progressActive,
              known.has(c.id) && styles.progressKnown,
            ]}
          />
        ))}
      </View>

      <View style={styles.center}>
        <Flashcard card={card} flipped={flipped} onFlip={flip} />
      </View>

      <View style={styles.actions}>
        <Pressable onPress={prev} style={[styles.navBtn, index === 0 && { opacity: 0.3 }]}>
          <Icon name="arrowL" size={20} color={C.text} />
        </Pressable>

        <Pressable onPress={() => next(false)} style={[styles.actionBtn, { backgroundColor: C.red + "20" }]}>
          <Icon name="x" size={20} color={C.red} />
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.red }]}>Tekrar et</Text>
        </Pressable>

        <Pressable onPress={() => next(true)} style={[styles.actionBtn, { backgroundColor: C.green + "20" }]}>
          <Icon name="check" size={20} color={C.green} />
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.green }]}>Bildim</Text>
        </Pressable>

        <Pressable
          onPress={() => next(false)}
          style={[styles.navBtn, index === total - 1 && { opacity: 0.3 }]}
        >
          <Icon name="arrowR" size={20} color={C.text} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  progressRow: {
    flexDirection: "row", justifyContent: "center", gap: 6,
    paddingHorizontal: SPACING.lg, marginTop: SPACING.sm,
  },
  progressDot: {
    flex: 1, height: 4, borderRadius: 2, backgroundColor: C.surface2, maxWidth: 60,
  },
  progressActive: { backgroundColor: C.amber },
  progressKnown: { backgroundColor: C.green },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: SPACING.lg },
  flashcard: {
    width: CARD_W, minHeight: 280,
    backgroundColor: C.surface, borderRadius: RADIUS.xxl,
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
    padding: SPACING.xxxl,
    ...SHADOWS.card,
  },
  cardLabel: {
    flexDirection: "row", alignItems: "center", gap: 4,
    position: "absolute", top: SPACING.lg,
  },
  actions: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl,
  },
  navBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.surface, alignItems: "center", justifyContent: "center",
  },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
});
