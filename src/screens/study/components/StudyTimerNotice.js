import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";

export function StudyTimerNotice({ C }) {
  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <Icon name="info" size={13} color={C.text3} />
        <Text style={[TYPOGRAPHY.caption, s.text, { color: C.text3 }]}>
          Çözdüğün soruyu bitişte soracağız. Şimdi sadece odaklan.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    width: "100%",
    paddingHorizontal: GUTTER,
    marginTop: STEP.s1 + 3,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
  },
});

