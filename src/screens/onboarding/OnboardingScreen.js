import { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { setAuthIntent } from "../../lib/authIntent";
import { Button } from "../../components/design";
import { RouteIllustration } from "./components/RouteIllustration";
import { QuestionPreviewList } from "./components/QuestionPreviewList";

export default function OnboardingScreen() {
  const C = useC();
  const { markSlidesAsSeen } = useExam();

  // Iki aksiyon ayni yere dusmemeli: AuthStack niyete gore aciliyor.
  const createRoute = useCallback(() => {
    setAuthIntent("register");
    markSlidesAsSeen();
  }, [markSlidesAsSeen]);

  const goToLogin = useCallback(() => {
    setAuthIntent("login");
    markSlidesAsSeen();
  }, [markSlidesAsSeen]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <View style={styles.scroll}>
          <Animated.View entering={FadeIn.duration(350)}>
            <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>
              MARATON
            </Text>
            <Text style={[styles.headline, { color: C.text }]}>
              Sınava kadar olan yolu bir rotaya çeviriyoruz.
            </Text>
            <Text style={[TYPOGRAPHY.body, { color: C.text3, marginTop: STEP.s2, maxWidth: 300 }]}>
              Her gün nereye gideceğini biliyorsun, her denemede rotanın nereye çıktığını
              görüyorsun.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(350)}>
            <RouteIllustration />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(350)}>
            <QuestionPreviewList />
          </Animated.View>
        </View>

        <View style={{ flex: 1 }} />

        <Animated.View entering={FadeInDown.delay(280).duration(350)} style={styles.footer}>
          <Button onPress={createRoute} size="lg" fullWidth>
            Rotamı kur
          </Button>
          <Pressable onPress={goToLogin} hitSlop={12} style={styles.loginLink} accessibilityRole="button">
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>
              Hesabım var, giriş yap
            </Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 },
  headline: { ...TYPOGRAPHY.display, marginTop: STEP.s3, maxWidth: 300 },
  footer: { paddingHorizontal: GUTTER, paddingBottom: STEP.s3 },
  loginLink: { alignItems: "center", marginTop: STEP.s3, minHeight: 44, justifyContent: "center" },
});
