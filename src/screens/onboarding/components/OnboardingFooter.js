import { View, Text, StyleSheet } from "react-native";
import { Button } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";

// Tek birincil aksiyon, filmin her aninda. "Devam et"e uc kez basma duvari yok.
export function OnboardingFooter({ onStart, onLogin, C }) {
  return (
    <View style={s.footer}>
      <Button variant="primary" size="lg" fullWidth iconRight="arrowR" onPress={onStart}>
        Rotamı kur
      </Button>

      <Text style={[TYPOGRAPHY.micro, s.reassurance, { color: C.text3 }]}>
        Hesabını aç, üç kısa soruyla rotan çizilsin.
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
          Hesabım var, <Text style={{ color: C.accentText }}>giriş yap</Text>
        </Text>
      </Press>
    </View>
  );
}

const s = StyleSheet.create({
  footer: {
    paddingHorizontal: GUTTER,
    paddingBottom: STEP.s2,
    paddingTop: STEP.s2,
  },
  reassurance: {
    textAlign: "center",
    marginTop: STEP.s2,
  },
  loginLink: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: CONTROL.tapMin,
  },
});
