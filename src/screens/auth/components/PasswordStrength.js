import { View, Text } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

function strengthOf(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
  return Math.min(score, 2);
}

// Kayıt ekranındaki şifre gücü çubuğu — "En az 8 karakter" ipucu.
export function PasswordStrength({ password }) {
  const C = useC();
  const score = strengthOf(password);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s1 - 2 }}>
      {[0, 1].map((i) => (
        <View
          key={i}
          style={{
            width: 34,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: i < score ? C.up : C.track,
          }}
        />
      ))}
      <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>En az 8 karakter</Text>
    </View>
  );
}
