import { View, Text, StyleSheet } from "react-native";
import { STEP, GUTTER } from "../../../themes/tokens";

export function StudyTimerNotice({ C }) {
  return (
    <View style={s.wrap}>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <View style={[s.dot, { backgroundColor: C.text4 }]} />
        <Text style={[s.text, { color: C.text3 }]}>
          Çözdüğün soruyu bitişte soracağız. Şimdi sadece çalış.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    width: "100%",
    paddingHorizontal: GUTTER,
    marginTop: STEP.s2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 2,
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontFamily: "Archivo_500Medium",
    fontSize: 12.5,
    lineHeight: 18,
  },
});


