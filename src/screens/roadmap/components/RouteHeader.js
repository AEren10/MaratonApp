import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY, NAV_ICON } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

// Rota derinligi ekranlarinin ust satiri: geri oku (ya da kapat X) +
// Bricolage baslik + istege bagli sag aksiyon (Durak Detayi'ndaki uc nokta).
// Gorsel ikon tasarim boyutunda, dokunma alani 44px.
export function RouteHeader({ title, onBack, close = false, onMore, moreLabel, moreIcon, hideBack = false, isRoot = false }) {
  const C = useC();
  const showBack = !isRoot && !hideBack && Boolean(onBack);
  return (
    <View style={s.row}>
      {showBack ? (
        <Press haptic="none"
          onPress={onBack}
          hitSlop={STEP.s1}
          accessibilityRole="button"
          accessibilityLabel={close ? "Kapat" : "Geri"}
          style={s.tap}
        >
          <Icon name={close ? "x" : "arrowL"} size={close ? NAV_ICON.close : NAV_ICON.back} color={C.text2} />
        </Press>
      ) : null}
      <Text style={[TYPOGRAPHY.heading, s.title, { color: C.text, paddingLeft: showBack ? 0 : STEP.s1 }]} numberOfLines={1}>
        {title || ""}
      </Text>
      {onMore ? (
        <Press haptic="none"
          onPress={onMore}
          hitSlop={STEP.s1}
          accessibilityRole="button"
          accessibilityLabel={moreLabel}
          style={s.tap}
        >
          {moreIcon ? (
            <Icon name={moreIcon} size={NAV_ICON.action} color={C.text2} />
          ) : (
            <View style={s.vertical}><Icon name="more" size={NAV_ICON.action} color={C.text2} fill={C.text2} /></View>
          )}
        </Press>
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
