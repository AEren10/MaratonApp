import { View, Text, Pressable, Platform } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useC } from "../../../contexts/ThemeContext";
import { useAlert } from "../../../contexts/AlertContext";
import { useSocialAuth } from "../../../hooks/useSocialAuth";
import * as H from "../../../lib/haptics";

function GoogleIcon({ size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09a7.2 7.2 0 0 1 0-4.17V7.07H2.18A11.97 11.97 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l3.56-2.77z" fill="#FBBC05" />
      <Path d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.07l3.66 2.84c.87-2.6 3.3-4.16 6.16-4.16z" fill="#EA4335" />
    </Svg>
  );
}

function AppleIcon({ size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="#FFFFFF">
      <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.62-2.2.44-3.06-.4C3.79 16.17 4.36 9.53 8.7 9.28c1.27.07 2.16.72 2.91.77.99-.2 1.94-.78 3-.84 1.28-.08 2.25.48 2.88 1.22-2.65 1.58-2.02 5.07.56 6.04-.47 1.24-.67 1.77-1.29 2.86l.29-.05zM12.05 9.19c-.15-2.35 1.72-4.39 3.95-4.56.32 2.62-2.36 4.7-3.95 4.56z" />
    </Svg>
  );
}

export function SocialAuthButtons() {
  const C = useC();
  const showAlert = useAlert();
  const { signInWithApple, signInWithGoogle, busy } = useSocialAuth();

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      H.success();
    } catch (err) {
      if (err.code === "SIGN_IN_CANCELLED") return;
      H.error();
      showAlert("Google ile giriş başarısız", err.message ?? "Bir sorun oldu");
    }
  };

  const handleApple = async () => {
    try {
      await signInWithApple();
      H.success();
    } catch (err) {
      if (err.code === "ERR_REQUEST_CANCELED") return;
      H.error();
      showAlert("Apple ile giriş başarısız", err.message ?? "Bir sorun oldu");
    }
  };

  const btnStyle = (pressed) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 999,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
    opacity: busy ? 0.6 : pressed ? 0.85 : 1,
  });

  return (
    <View style={{ gap: 10 }}>
      <Pressable onPress={handleGoogle} disabled={busy} style={({ pressed }) => btnStyle(pressed)}>
        <GoogleIcon />
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.text }}>
          Google ile devam et
        </Text>
      </Pressable>

      {Platform.OS === "ios" && (
        <Pressable
          onPress={handleApple}
          disabled={busy}
          style={({ pressed }) => ({
            ...btnStyle(pressed),
            backgroundColor: "#FFFFFF",
            borderColor: "#FFFFFF",
          })}
        >
          <AppleIcon />
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#000000" }}>
            Apple ile devam et
          </Text>
        </Pressable>
      )}
    </View>
  );
}
