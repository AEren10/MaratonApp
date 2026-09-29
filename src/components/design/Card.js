import { View, StyleSheet } from "react-native";
import { useC, useTheme } from "../../contexts/ThemeContext";
import { mix } from "../../themes/colorMix";
import { SHAPE, STEP } from "../../themes/tokens";

// Tasarimda derinlik golgeyle degil yuzey tonu + 1px kenarlikla kurulur.
// tone: surface (kart) | elev (acilan panel, ikon kutusu) | void (girinti/kuyu)
const TONES = {
  surface: (C) => ({ bg: C.surface, border: C.border }),
  elev:    (C) => ({ bg: C.elev,    border: C.border }),
  void:    (C) => ({ bg: C.void,    border: C.line }),
  tint:    (C) => ({ bg: C.brandTint, border: "transparent" }),
};

export function Card({
  children,
  tone = "surface",
  radius = "card",
  padded = true,
  bordered = true,
  style,
  ...rest
}) {
  const C = useC();
  const { isDark } = useTheme();
  const t = (TONES[tone] || TONES.surface)(C);
  // Ust kenar isigi: isik yukaridan geliyor (ScreenDepth), kartin ust kenari
  // onu yakalar. Golge yok; yalniz kenarligin ust cizgisi bir ton acik.
  // Yalniz koyu temada ve yukselen yuzeylerde -- girinti (void) isik almaz.
  const lit = isDark && bordered && (tone === "surface" || tone === "elev");

  return (
    <View
      style={[
        {
          backgroundColor: t.bg,
          borderRadius: SHAPE[radius] ?? radius,
        },
        bordered && t.border !== "transparent" && { borderWidth: 1, borderColor: t.border },
        lit && { borderTopColor: mix(C.text, 22, t.border) },
        padded && styles.padded,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  padded: { padding: STEP.s3 },
});
