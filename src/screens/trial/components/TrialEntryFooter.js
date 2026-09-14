import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, STEP } from "../../../themes/tokens";

// Tasarim "Küçük Ekran" (375×667): devam butonu icerikle kaymaz, alt seride
// sabitlenir; icerik onun altindan kayar.
export function TrialEntryFooter({ children }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + STEP.s2, backgroundColor: C.bg, borderTopColor: C.line }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, borderTopWidth: 1 },
});
