import { View, Text, StyleSheet } from "react-native";
import { Button } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";

export function OnboardingFooter({ isLastSlide = false, onNext, onStart, onLogin, C }) {
  return (
    <View style={s.footer}>
      {isLastSlide ? (
        <Button variant="primary" size="lg" fullWidth onPress={onStart}>
          Rotamı kur
        </Button>
      ) : (
        <Button variant="primary" size="lg" fullWidth onPress={onNext}>
          Devam Et
        </Button>
      )}

      <Text style={[TYPOGRAPHY.micro, s.reassurance, { color: C.text3 }]}>
        Hesap sonra. Önce rotanı görüyorsun.
      </Text>

      <Press
        haptic="none"
        onPress={onLogin}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Giriş yap"
        style={s.loginLink}
      >
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>
          Hesabım var, giriş yap
        </Text>
      </Press>
    </View>
  );
}

const s = StyleSheet.create({
  footer: {
    paddingHorizontal: GUTTER,
    paddingBottom: STEP.s3,
    paddingTop: STEP.s2,
  },
  reassurance: {
    textAlign: "center",
    marginTop: STEP.s2,
    marginBottom: STEP.s1,
  },
  loginLink: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: CONTROL.tapMin,
  },
});
