import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";

export function StudyTimerNotice({ C }) {
  return (
    <View style={s.wrap}>
      <View style={[s.box, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <View style={[s.dot, { backgroundColor: C.text4 }]} />
        <Text style={[TYPOGRAPHY.captionMedium, s.text, { color: C.text3 }]}>
          Çözdüğün soruyu bitişte soracağız. Şimdi sadece çalış.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: "100%", paddingHorizontal: GUTTER, marginTop: STEP.s2 },
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: { width: 7, height: 7, borderRadius: 1 },
  text: { flex: 1, lineHeight: 18 },
});
