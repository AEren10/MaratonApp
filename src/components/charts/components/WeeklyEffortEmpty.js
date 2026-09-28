import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function WeeklyEffortEmpty({ height }) {
  const C = useC();
  return (
    <View
      style={[s.emptyBox, { height, borderColor: C.line, backgroundColor: C.surface }]}
      accessible
      accessibilityLabel="Bu hafta henüz çalışma kaydın yok."
    >
      <View style={[s.emptyIcon, { backgroundColor: C.elev }]}>
        <Icon name="trendUp" size={20} color={C.text3} />
      </View>
      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, marginTop: STEP.s2 }]}>
        Bu hafta henüz çalışma kaydın yok
      </Text>
      <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: 4, textAlign: "center" }]}>
        Çalışmaya başladığında günlük soru grafiğin burada oluşur.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  emptyBox: {
    width: "100%",
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: STEP.s4,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: SHAPE.button,
    alignItems: "center",
    justifyContent: "center",
  },
});
