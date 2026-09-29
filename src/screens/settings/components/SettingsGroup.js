import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Kutudan cikarildi: bolum basligi altinda duz liste duzeni.
// Satirlar zeminde durur, satirlar arasinda C.line ayirici bulunur.
export function SettingsGroup({ title, children }) {
  const C = useC();
  return (
    <View style={styles.container}>
      {title ? (
        <Text style={[TYPOGRAPHY.label, styles.title, { color: C.text3 }]}>{title}</Text>
      ) : null}
      <View style={styles.list}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: STEP.s4, paddingHorizontal: GUTTER },
  title: { marginBottom: STEP.s1, letterSpacing: 1.4 },
  list: {},
});
