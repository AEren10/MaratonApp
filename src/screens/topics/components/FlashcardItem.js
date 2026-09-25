import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

const { width: SW } = Dimensions.get("window");
const CARD_W = SW - 44;

export function FlashcardItem({ card, flipped, onFlip, C }) {
  return (
    <Press haptic="none" onPress={onFlip} style={[s.flashcard, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={s.cardLabel}>
        <Icon name={flipped ? "eye" : "eyeOff"} size={14} color={C.text3} />
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>
          {flipped ? "CEVAP" : "SORU"}
        </Text>
      </View>
      <Text style={[
        flipped ? TYPOGRAPHY.body : TYPOGRAPHY.subheading,
        { color: C.text, textAlign: "center" },
      ]}>
        {flipped ? card.back : card.front}
      </Text>
      <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s3 }]}>
        Çevirmek için dokun
      </Text>
    </Press>
  );
}

const s = StyleSheet.create({
  flashcard: {
    width: CARD_W,
    minHeight: 280,
    borderRadius: SHAPE.card,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: STEP.s4,
  },
  cardLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    position: "absolute",
    top: STEP.s3,
  },
});
