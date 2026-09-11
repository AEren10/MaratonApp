import { ScrollView, Pressable, Text, StyleSheet } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

// Tasarim: "Paylas Ekrani" mod sekmeleri — burada sekiz Story kartından
// hangisinin gorunecegini seciyor (yalniz verisi olanlar listede).
export function ShareModeChips({ cards, selectedId, onSelect }) {
  const C = useC();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {cards.map((card) => {
        const selected = card.id === selectedId;
        return (
          <Pressable
            key={card.id}
            onPress={() => {
              H.select();
              onSelect(card.id);
            }}
            hitSlop={8}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? C.brandTint : "transparent",
                borderColor: selected ? C.accent : C.border,
              },
            ]}
          >
            <Text
              style={[
                TYPOGRAPHY.captionMedium,
                { color: selected ? C.text : C.text3 },
              ]}
            >
              {card.title}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: STEP.s1, paddingHorizontal: STEP.s3 },
  chip: {
    height: CONTROL.chip,
    minWidth: 44,
    paddingHorizontal: STEP.s3,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
