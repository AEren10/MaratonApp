import { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useC } from "../../../contexts/ThemeContext";
import { StatBlock } from "../../../components/design/StatBlock";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { StoryCardVisual } from "./StoryCardVisual";

// Tasarim kaynagi: "Maraton Story Karti" + AKIS 12B (8 Story kartı).
// Derinlik yuzey tonu + kenarlikla; golge YOK. Kart 9:16 story oranina
// yakin bir govde icinde, capture icin collapsable={false}.
// transparent: Instagram'a giden hali -- zemin, cerceve ve ust marka satiri
// YOK, yalniz veri ve grafik (Strava etiketi gibi); Instagram'da kullanici
// istedigi fotografin ya da zeminin ustune koyar.
export const ShareStoryCard = forwardRef(function ShareStoryCard(
  { card, footRight, transparent = false },
  ref,
) {
  const C = useC();
  if (!card) return null;
  const heroColor = card.id === "route_move"
    ? (card.heroValue?.startsWith("+") ? C.up : card.heroValue?.startsWith("-") ? C.down : C.text)
    : C.text;

  return (
    <Animated.View
      ref={ref}
      collapsable={false}
      entering={transparent ? undefined : FadeIn.duration(500)}
      style={[styles.card, transparent ? styles.bare : { borderColor: C.border }]}
    >
      {transparent ? null : (
        <LinearGradient
          colors={[C.surface, C.bg, C.surface]}
          locations={[0, 0.58, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      <View style={styles.body}>
        <Text style={[TYPOGRAPHY.label, styles.kicker, { color: C.accentBright }]}>
          {card.title}
        </Text>

        <StatBlock
          value={card.heroValue}
          unit={card.heroLabel}
          size="large"
          color={heroColor}
          style={styles.hero}
        />

        <StoryCardVisual id={card.id} />

        {card.caption ? (
          <Text style={[TYPOGRAPHY.body, styles.caption, { color: C.text2 }]}>
            {card.caption}
          </Text>
        ) : null}
      </View>

      <View style={styles.footerContainer}>
        {card.stats?.length ? (
          <View style={[styles.statsRow, { borderTopColor: "rgba(245,242,239,0.1)" }]}>
            {card.stats.map((stat) => (
              <View key={stat.label} style={styles.statCell}>
                <Text
                  style={[TYPOGRAPHY.label, styles.statLabel, { color: C.text3 }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {stat.label}
                </Text>
                <StatBlock value={stat.value} size="value" color={stat.color || C.text} style={styles.statValue} />
              </View>
            ))}
          </View>
        ) : null}

        <View style={[styles.footer, { borderTopColor: "rgba(245,242,239,0.1)" }]}>
          <View style={styles.footerLeft}>
            <View style={[styles.markSmall, { backgroundColor: C.brandFill }]}>
              <Text style={[styles.markSmallText, { color: C.accentInk }]}>m</Text>
            </View>
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>maraton</Text>
          </View>
          {footRight ? (
            <Text style={[TYPOGRAPHY.label, { color: "rgba(245,242,239,0.42)" }]}>{footRight}</Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 22,
    aspectRatio: 9 / 16,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  // Ust marka satiri kalkti (altta zaten marka var): baslik onunla ust uste
  // biniyordu.
  body: { flex: 1, justifyContent: "center" },
  bare: { borderWidth: 0, backgroundColor: "transparent" },
  kicker: { letterSpacing: 1.6, textTransform: "uppercase" },
  hero: { marginTop: STEP.s2 },
  caption: { marginTop: STEP.s2, maxWidth: 250 },
  footerContainer: { marginTop: STEP.s3 },
  statsRow: { flexDirection: "row", gap: STEP.s2, paddingBottom: STEP.s3, borderTopWidth: 1, paddingTop: STEP.s3 },
  statCell: { flex: 1 },
  statLabel: { letterSpacing: 1.0 },
  statValue: { marginTop: 4 },
  footer: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: STEP.s3, borderTopWidth: 1,
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  markSmall: { width: 18, height: 18, borderRadius: 5, alignItems: "center", justifyContent: "center" },
  markSmallText: { fontFamily: "Archivo_700", fontSize: 11, marginBottom: 1 },
});
