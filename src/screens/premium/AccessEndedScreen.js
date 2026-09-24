import React, { useCallback } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Button } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { ACCESS_ENDED as A } from "../../constants/accessEnded";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../themes/tokens";
import * as H from "../../lib/haptics";
import { AccessEndedFreeList } from "./components/AccessEndedFreeList";
import { AccessEndedLocked } from "./components/AccessEndedLocked";

// Tasarim: "Deneme Bitti". Ilk hafta erisimi bittiginde bir kez
// (useAccessEndedMoment). Kayip degil geri donus: once acik kalanlar.
export default function AccessEndedScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const goPro = useCallback(() => {
    H.select();
    navigation.replace(SCREENS.PREMIUM, { source: "access_ended" });
  }, [navigation]);
  const stayFree = useCallback(() => { H.tap(); navigation.goBack(); }, [navigation]);

  return (
    <View style={[styles.root, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>{A.header}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View style={styles.hero}>
          <Text style={[TYPOGRAPHY.label, { color: C.warn }]}>{A.eyebrow}</Text>
          <Text style={[TYPOGRAPHY.display, styles.title, { color: C.text }]}>{A.title}</Text>
          <Text style={[TYPOGRAPHY.body, styles.body, { color: C.text2 }]}>{A.body}</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(520).delay(160)}>
          <AccessEndedFreeList />
          <AccessEndedLocked />
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + STEP.s2, borderTopColor: C.line }]}>
        <Button onPress={goPro} size="lg" fullWidth>{A.primary}</Button>
        <Pressable onPress={stayFree} style={styles.secondary} accessibilityRole="button">
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text3 }]}>{A.secondary}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { minHeight: CONTROL.tapMin, justifyContent: "center", paddingHorizontal: GUTTER, paddingTop: 4 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: STEP.s4 },
  hero: { paddingTop: STEP.s4, paddingHorizontal: 4 },
  title: { marginTop: STEP.s2, maxWidth: 300 },
  body: { marginTop: STEP.s2, maxWidth: 290 },
  footer: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, borderTopWidth: 1 },
  secondary: { height: CONTROL.tapMin, marginTop: STEP.s1, alignItems: "center", justifyContent: "center" },
});
