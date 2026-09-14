import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { PREVIEW_FOOTNOTE } from "../../../constants/proPreviewVariants";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";

// Onizleme varyantlarinin (Geçmiş, Tempo) ortak tam ekran cercevesi:
// kapat + baslik, icerik, birincil buton + ikincil + alt satir.
export function ProPreviewFrame({ title, primary, secondary, onPrimary, onDismiss, children }) {
  const C = useC();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onDismiss} style={styles.close} accessibilityRole="button" accessibilityLabel={secondary}>
          <Icon name="x" size={14} color={C.text2} sw={1.7} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, styles.title, { color: C.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + STEP.s3 }]}
      >
        {children}
        <Button onPress={onPrimary} size="lg" fullWidth style={styles.cta}>
          {primary}
        </Button>
        <Pressable onPress={onDismiss} style={styles.secondary} accessibilityRole="button">
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>{secondary}</Text>
        </Pressable>
        <Text style={[TYPOGRAPHY.micro, styles.center, { color: C.text3 }]}>{PREVIEW_FOOTNOTE}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: STEP.s1, paddingHorizontal: GUTTER - 10, paddingTop: 4 },
  close: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  title: { flex: 1 },
  content: { paddingHorizontal: GUTTER },
  cta: { marginTop: STEP.s3 },
  secondary: { height: CONTROL.tapMin, alignItems: "center", justifyContent: "center", marginTop: 4 },
  center: { textAlign: "center" },
});
