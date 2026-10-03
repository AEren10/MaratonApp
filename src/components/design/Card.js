import { View, StyleSheet } from "react-native";
import { useC, useTheme } from "../../contexts/ThemeContext";
import { mix } from "../../themes/colorMix";
import { SHAPE, STEP, SHADOW } from "../../themes/tokens";

// Tasarimda derinlik koyu temada yuzey tonu + 1px kenarlikla kurulur.
// Acik temada ise beyaz kartlar zeminden ince sicak kenarlik ve hafif sicak kahve golgesiyle ayrilir.
// tone: surface (kart) | elev (acilan panel, ikon kutusu) | void (girinti/kuyu)
const TONES = {
  surface: (C) => ({ bg: C.surface, border: C.line }),
  elev:    (C) => ({ bg: C.elev,    border: C.line }),
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
  // onu yakalar. Yalniz koyu temada ve yukselen yuzeylerde -- girinti (void) isik almaz.
  const lit = isDark && bordered && (tone === "surface" || tone === "elev");
  const shadow = !isDark && (tone === "surface" || tone === "elev") ? SHADOW.cardLight : null;

  return (
    <View
      style={[
        {
          backgroundColor: t.bg,
          borderRadius: SHAPE[radius] ?? radius,
        },
        shadow,
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
