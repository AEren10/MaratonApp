import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../design/Icon";
import { alpha } from "../../themes/colorMix";
import { getSubjectBadge, getSubjectGlyph } from "../../themes/subjects";

// Ders ikonu: pastel daire + ders renginde ince cizgi ikon. Dersin ikonu
// yoksa eski kisaltmaya (TR, MAT...) duser.
function SubjectIcon({ subject, color, size = 36 }) {
  const glyph = getSubjectGlyph(subject);
  const tint = { width: size, height: size, borderRadius: size / 2, backgroundColor: alpha(color, 14) };
  return (
    <View style={[s.circle, tint]} accessibilityElementsHidden importantForAccessibility="no">
      {glyph
        ? <Icon name={glyph} size={Math.round(size * 0.5)} color={color} sw={1.8} />
        : <Text style={[s.badge, { color }]}>{getSubjectBadge(subject)}</Text>}
    </View>
  );
}

export default memo(SubjectIcon);
export { SubjectIcon };

const s = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
  badge: { fontFamily: "Archivo_700", fontSize: 11, letterSpacing: 0.5 },
});
