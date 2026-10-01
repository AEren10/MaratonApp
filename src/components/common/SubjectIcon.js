import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../design/Icon";
import { alpha } from "../../themes/colorMix";
import { getSubjectBadge, getSubjectGlyph } from "../../themes/subjects";

// Ders ikonu: pastel daire + ders renginde ince cizgi ikon. Dersin ikonu
// yoksa eski kisaltmaya (TR, MAT...) duser. AYT/YDT dersi (subjectKey
// ayt_/ydt_ ile baslar) ayni ikonu ders renginde bir HALKAYLA tasir: TYT
// Matematik ile AYT Matematik yan yana bir bakista ayrilir.
function SubjectIcon({ subject, subjectKey, color, size = 36 }) {
  const glyph = getSubjectGlyph(subjectKey || subject);
  const advanced = /^(ayt|ydt)_/.test(String(subjectKey || ""));
  const tint = {
    width: size, height: size, borderRadius: size / 2,
    backgroundColor: alpha(color, advanced ? 20 : 14),
    ...(advanced ? { borderWidth: 1.5, borderColor: color } : null),
  };
  return (
    <View style={[s.circle, tint]} accessibilityElementsHidden importantForAccessibility="no">
      {glyph
        ? <Icon name={glyph} size={Math.round(size * 0.5)} color={color} sw={1.8} />
        : <Text style={[s.badge, { color }]}>{getSubjectBadge(subjectKey || subject)}</Text>}
    </View>
  );
}

export default memo(SubjectIcon);
export { SubjectIcon };

const s = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
  badge: { fontFamily: "Archivo_700", fontSize: 11, letterSpacing: 0.5 },
});
