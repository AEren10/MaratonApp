import { View, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { SHAPE } from "../../../themes/tokens";

// Tasarimin kare anahtari: 44x26, r6. Acikken kizil zemin, dugum sagda.
export function ExamSwitch({ on }) {
  const C = useC();
  return (
    <View style={[s.track, { backgroundColor: on ? C.brandFill : C.track, alignItems: on ? "flex-end" : "flex-start" }]}>
      <View style={[s.knob, { backgroundColor: on ? C.accentInk : C.text3 }]} />
    </View>
  );
}

const s = StyleSheet.create({
  track: { width: 44, height: 26, borderRadius: SHAPE.chip, justifyContent: "center", paddingHorizontal: 3 },
  knob: { width: 20, height: 20, borderRadius: SHAPE.chip },
});
