import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { RouteHeader } from "./RouteHeader";

// Ara Verme ve Rotayi Yeniden Ciz'in ortak iskeleti: kapat X, Bricolage
// cumle, aciklama, sayi kartlari (children), birincil aksiyon + vazgec.
export function RouteConfirmLayout({
  title, body, children, primaryLabel, onPrimary, loading, cancelLabel, onCancel,
}) {
  const C = useC();
  return (
    <SafeAreaView edges={["top", "bottom"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <RouteHeader close onBack={onCancel} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} style={s.intro}>
          <Text style={[TYPOGRAPHY.heading, s.title, { color: C.text }]}>{title}</Text>
          <Text style={[TYPOGRAPHY.body, s.body, { color: C.text3 }]}>{body}</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(80).duration(600)} style={s.cards}>
          {children}
        </Animated.View>
        <View style={s.actions}>
          <Button size="lg" fullWidth loading={loading} onPress={onPrimary}>{primaryLabel}</Button>
          <Pressable
            onPress={onCancel}
            disabled={loading}
            accessibilityRole="button"
            style={({ pressed }) => [s.cancel, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>{cancelLabel}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: STEP.s4 },
  intro: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 },
  title: { maxWidth: 300 },
  body: { marginTop: STEP.s2, maxWidth: 306 },
  cards: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 - STEP.s1 / 2, gap: STEP.s2 },
  actions: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 - STEP.s1 / 2 },
  cancel: { minHeight: CONTROL.tapMin + STEP.s1 / 2, marginTop: STEP.s1, alignItems: "center", justifyContent: "center" },
});
