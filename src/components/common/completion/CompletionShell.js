import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Button, Icon } from "../../design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Uc tamamlama aninin ortak iskeleti (AKIS 16). Tam ekran modal:
// tasarimda artboardlarin tamami 390x844, kart degil.
// Hareket: tek tur giris (FadeIn/FadeInDown). Konfeti/rozet/ses YOK.
export function CompletionShell({
  visible,
  onClose,
  eyebrow,
  eyebrowMuted,
  title,
  body,
  children,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}) {
  const C = useC();
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <Pressable
          onPress={onClose}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel="Kapat"
          style={s.close}
        >
          <Icon name="arrowL" size={16} color={C.text2} />
        </Pressable>

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(360)} style={s.head}>
            <Text style={[TYPOGRAPHY.label, { color: eyebrowMuted ? C.text3 : C.accentBright }]}>
              {eyebrow}
            </Text>
            <Text style={[TYPOGRAPHY.display, s.title, { color: C.text }]}>{title}</Text>
            {body ? (
              <Text style={[TYPOGRAPHY.body, s.body, { color: C.text2 }]}>{body}</Text>
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(420)} style={s.content}>
            {children}
          </Animated.View>
        </ScrollView>

        <Animated.View entering={FadeInDown.delay(220).duration(420)} style={s.footer}>
          {primaryLabel ? (
            <Button size="lg" fullWidth onPress={onPrimary || onClose}>
              {primaryLabel}
            </Button>
          ) : null}
          {secondaryLabel ? (
            <Pressable
              onPress={onSecondary || onClose}
              accessibilityRole="button"
              style={({ pressed }) => [
                s.secondary,
                { borderColor: C.border, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text2 }]}>{secondaryLabel}</Text>
            </Pressable>
          ) : null}
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  scroll: { paddingBottom: STEP.s4 },
  close: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    marginLeft: GUTTER - 14,
    alignItems: "center",
    justifyContent: "center",
  },
  head: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  title: { marginTop: STEP.s2 + 4, maxWidth: 310 },
  body: { marginTop: STEP.s2 + 2, maxWidth: 292 },
  content: { marginTop: STEP.s3, gap: STEP.s3 },
  footer: {
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2 + 2,
    paddingBottom: STEP.s2 + 2,
    gap: STEP.s2,
  },
  secondary: {
    height: CONTROL.buttonTertiary + 2,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
