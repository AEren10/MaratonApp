import { View, Text, Pressable, StyleSheet } from "react-native";

import { Button } from "../../../components/design";
import { TYPOGRAPHY, SHAPE, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Tasarim: kalma secenegi BIRINCIL (dolu kizil), iptal sessiz cercevede
// (`down` grisi). Iptal uygulama icinde yapilamaz; buton magaza sayfasini
// aciyor, onay orada veriliyor.
export function CancelActions({ onKeep, onConfirm }) {
  const C = useC();

  return (
    <View>
      <Button onPress={onKeep} size="lg" fullWidth>Premium&apos;da kal</Button>
      <Pressable
        onPress={onConfirm}
        accessibilityRole="button"
        accessibilityLabel="İptali onayla, mağaza sayfası açılır"
        style={({ pressed }) => [
          styles.quiet,
          { borderColor: C.down, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.down }]}>İptali onayla</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  quiet: {
    height: CONTROL.buttonSecondary,
    marginTop: 10,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
