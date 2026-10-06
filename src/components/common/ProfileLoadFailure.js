import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Icon } from "../design";
import { useC } from "../../contexts/ThemeContext";
import { GUTTER, STEP, TYPOGRAPHY } from "../../themes/tokens";

export function ProfileLoadFailure({ onRetry }) {
  const C = useC();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: C.bg }]}>
      <View style={styles.content}>
        <Icon name="alert" size={40} color={C.warn} />
        <Text style={[TYPOGRAPHY.heading, styles.title, { color: C.text }]}>Profilin yüklenemedi.</Text>
        <Text style={[TYPOGRAPHY.body, styles.body, { color: C.text3 }]}>Bağlantını kontrol edip yeniden deneyebilirsin. Kurulum bilgilerin değiştirilmedi.</Text>
        <Button onPress={onRetry} size="lg" fullWidth style={styles.button}>Tekrar dene</Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center" },
  content: { paddingHorizontal: GUTTER, alignItems: "center" },
  title: { marginTop: STEP.s3, textAlign: "center" },
  body: { marginTop: STEP.s2, textAlign: "center" },
  button: { marginTop: STEP.s4 },
});
