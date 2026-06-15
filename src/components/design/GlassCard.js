import { Platform, View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

// Buzlu cam kart. Üst sheen + ışık kenar (glow olmadan da cam okunur).
// color verilirse karta o kimlik renginden hafif bir ton yıkanır (kenar çizgisi DEĞİL).
export function GlassCard({ children, style, radius = 22, intensity = 40, blurTint = "dark", color }) {
  const shape = { borderRadius: radius, overflow: "hidden", borderWidth: 1, borderColor: color ? color + "44" : "rgba(255,255,255,0.16)" };

  const overlay = (
    <>
      {color ? (
        <LinearGradient
          colors={[color + "33", color + "1A", color + "0A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      <LinearGradient
        colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.02)", "rgba(255,255,255,0)"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </>
  );

  if (Platform.OS === "web") {
    return (
      <View style={[shape, styles.fallback, style]}>
        {overlay}
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint={blurTint} style={[shape, styles.glassOverlay, style]}>
      {overlay}
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  glassOverlay: { backgroundColor: "rgba(255,255,255,0.07)" },
  fallback: { backgroundColor: "rgba(255,255,255,0.09)" },
});
