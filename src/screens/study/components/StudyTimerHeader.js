import { View, Text, Pressable } from "react-native";

import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";

// Tasarım: geri + ortalanmış eyebrow ("ODAK · Tur 1/4") + geçmiş kısayolu.
export function StudyTimerHeader({ C, eyebrow, eyebrowColor, onBack, onHistory }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: GUTTER - (CONTROL.tapMin - 24) / 2,
        paddingVertical: STEP.s2,
      }}
    >
      <Pressable
        onPress={onBack}
        hitSlop={12}
        accessibilityLabel="Geri"
        accessibilityRole="button"
        style={{ width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" }}
      >
        <Icon name="x" size={16} color={C.text2} />
      </Pressable>

      <Text
        style={[TYPOGRAPHY.label, { color: eyebrowColor || C.text3 }]}
        accessibilityRole="text"
        numberOfLines={1}
      >
        {eyebrow}
      </Text>

      <Pressable
        onPress={onHistory}
        hitSlop={12}
        accessibilityLabel="Geçmiş"
        accessibilityRole="button"
        style={{ width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" }}
      >
        <Icon name="clock" size={18} color={C.text3} />
      </Pressable>
    </View>
  );
}
