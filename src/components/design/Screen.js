import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SPACING } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

// Tek ekran iskeleti. Brief kuralı: "Ekran kenar boşluğu her ekranda aynı."
// Bir ekranda 16, diğerinde 20 olmasın diye kenar boşluğu buradan gelir.
export const SCREEN_PADDING = SPACING.lg; // 16

/**
 * <Screen>            → sabit yükseklik, kendi listeni koy (FlatList vb.)
 * <Screen scroll>     → ScrollView'lı, alt boşluk otomatik
 *
 * props:
 *   scroll        ScrollView'a sar
 *   padded        yatay kenar boşluğu uygula (varsayılan true)
 *   edges         SafeAreaView kenarları (varsayılan ["top"])
 *   bottomInset   scroll içeriğinin altına eklenecek boşluk (FAB/tab bar payı)
 */
export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ["top"],
  bottomInset = SPACING.huge,
  contentContainerStyle,
  style,
  ...rest
}) {
  const C = useC();
  const pad = padded ? { paddingHorizontal: SCREEN_PADDING } : null;

  if (scroll) {
    return (
      <SafeAreaView edges={edges} style={[styles.fill, { backgroundColor: C.bg }, style]}>
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[pad, { paddingBottom: bottomInset }, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...rest}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={edges} style={[styles.fill, { backgroundColor: C.bg }, style]} {...rest}>
      <View style={[styles.fill, pad]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
