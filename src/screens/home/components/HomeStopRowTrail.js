import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";
import { Icon } from "../../../components/design/Icon";

// Durak satirinin sag ucu: sure, "siradaki" noktasi ve tek bir aksiyon.
// Acik durakta "..." (ertele/tasi), bitmis durakta kalem (kaydi duzelt).
export function HomeStopRowTrail({ duration, isDone, isNext, canPostpone, onMenu, onEdit }) {
  const C = useC();
  const action = isDone ? onEdit : (canPostpone ? onMenu : null);

  return (
    <View style={s.col}>
      <Text style={[TYPOGRAPHY.tableValue, { color: isDone ? C.text3 : C.text2 }]}>{duration}</Text>
      {isNext && !isDone ? <View style={[s.dot, { backgroundColor: C.accent }]} /> : null}
      {action ? (
        <Press
          haptic="light"
          onPress={(e) => {
            e?.stopPropagation?.();
            action();
          }}
          hitSlop={STEP.s2}
          style={s.btn}
          accessibilityRole="button"
          accessibilityLabel={isDone ? "Kaydı düzenle" : "Durak seçenekleri"}
        >
          <Icon name={isDone ? "edit" : "more"} size={14} color={C.text3} />
        </Press>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  dot: { width: 6, height: 6, borderRadius: SHAPE.chip },
  btn: { minWidth: 28, minHeight: 28, alignItems: "center", justifyContent: "center" },
});
