import { memo } from "react";
import { Pressable, Text, StyleSheet } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, SHAPE, CONTROL, STEP } from "../../../themes/tokens";

// Tasarim "Onay": iki buton yan yana h52 r12. Vazgec cerceveli (text2),
// birincil marka dolgusu. Yikici aksiyon "Hesap Silme"deki gibi sessiz
// cerceve + danger; kirmizi dolgu yok.
function DialogActionBase({ label, kind, onPress, stretch }) {
  const C = useC();
  const tone = kind === "cancel"
    ? { bg: "transparent", border: C.border, text: C.text2, pressed: C.elev }
    : kind === "destructive"
      ? { bg: "transparent", border: C.danger, text: C.danger, pressed: C.elev }
      : { bg: C.brandFill, border: C.brandFill, text: C.textOnBrand, pressed: C.accentPress || C.accentPressed };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.btn,
        stretch && styles.stretch,
        { backgroundColor: pressed ? tone.pressed : tone.bg, borderColor: pressed ? tone.pressed : tone.border },
      ]}
    >
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.label, { color: tone.text }]}>{label}</Text>
    </Pressable>
  );
}

export const DialogAction = memo(DialogActionBase);

const styles = StyleSheet.create({
  btn: {
    height: CONTROL.buttonPrimary,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: STEP.s2,
  },
  stretch: { flex: 1 },
  label: { ...TYPOGRAPHY.bodySemiBold, fontFamily: TYPOGRAPHY.button.fontFamily },
});
