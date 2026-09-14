import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useC } from "../../../contexts/ThemeContext";
import { useProPreviewTempo } from "../../../hooks/useProPreviewTempo";
import { PREVIEW_TEMPO as P } from "../../../constants/proPreviewVariants";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { ProPreviewFrame } from "./ProPreviewFrame";
import { ProPreviewScenarioCard } from "./ProPreviewScenarioCard";
import { ProLockedRow } from "./ProLockedRow";

// Tasarim: "Önizleme · Tempo". Uc senaryo kullanicinin kendi
// denemelerinden; uygulama adimi kilitli. Tahmin yoksa kart da yok.
export function ProPreviewTempo({ onOpen, onDismiss }) {
  const C = useC();
  const { cards, sampleSize } = useProPreviewTempo();

  return (
    <ProPreviewFrame
      title={P.title}
      primary={P.primary}
      secondary={P.secondary}
      onPrimary={onOpen}
      onDismiss={onDismiss}
    >
      {cards.length && sampleSize ? (
        <Text style={[TYPOGRAPHY.body, styles.intro, { color: C.text2 }]}>{P.intro(sampleSize)}</Text>
      ) : null}

      <Animated.View entering={FadeInDown.duration(620)} style={styles.cards}>
        {cards.map((card) => <ProPreviewScenarioCard key={card.id} card={card} />)}
      </Animated.View>

      <View style={styles.apply}>
        <ProLockedRow label={P.lockedApply} width={46} boxed />
        <Text style={[TYPOGRAPHY.meta, styles.note, { color: C.text3 }]}>{P.note}</Text>
      </View>
    </ProPreviewFrame>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: STEP.s3, maxWidth: 302 },
  cards: { marginTop: STEP.s3, gap: STEP.s1 + 2 },
  apply: { marginTop: STEP.s3 },
  note: { marginTop: STEP.s2 },
});
