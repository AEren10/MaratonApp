import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Rota derinligi ekranlarinin ust satiri: geri oku (ya da kapat X) +
// Bricolage baslik + istege bagli sag aksiyon (Durak Detayi'ndaki uc nokta).
// Gorsel ikon tasarim boyutunda, dokunma alani 44px.
export function RouteHeader({ title, onBack, close = false, onMore, moreLabel, moreIcon, hideBack = false }) {
  const C = useC();
  const showBack = !hideBack && Boolean(onBack);
  return (
    <View style={s.row}>
      {showBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={STEP.s1}
          accessibilityRole="button"
          accessibilityLabel={close ? "Kapat" : "Geri"}
          style={s.tap}
        >
          <Icon name={close ? "x" : "chevL"} size={close ? 14 : 16} color={C.text2} />
        </Pressable>
      ) : null}
      <Text style={[TYPOGRAPHY.subheading, s.title, { color: C.text, paddingLeft: showBack ? 0 : STEP.s1 }]} numberOfLines={1}>
        {title || ""}
      </Text>
      {onMore ? (
        <Pressable
          onPress={onMore}
          hitSlop={STEP.s1}
          accessibilityRole="button"
          accessibilityLabel={moreLabel}
          style={s.tap}
        >
          {moreIcon ? (
            <Icon name={moreIcon} size={16} color={C.text3} />
          ) : (
            <View style={s.vertical}><Icon name="more" size={18} color={C.text3} fill={C.text3} /></View>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
    paddingLeft: GUTTER - STEP.s2,
    paddingRight: GUTTER - STEP.s2,
    minHeight: CONTROL.tapMin + STEP.s1,
  },
  tap: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  title: { flex: 1 },
  vertical: { transform: [{ rotate: "90deg" }] },
});
