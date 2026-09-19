import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

import { TYPOGRAPHY } from "../../themes/tokens";

// Etiketin altindaki marka satiri. Bu, paylasimin bize donen tek getirisi —
// her varyantta ayni yerde, ayni boyda durur ("kart" haric, onun kendi
// ayagi var).
export function StoryFoot({ p, daysToExam }) {
  return (
    <View style={s.wrap}>
      <View style={s.brand}>
        <View style={[s.mark, { backgroundColor: p.accent }]}>
          <Svg width={17} height={17} viewBox="0 0 18 18">
            <Path
              d="M2 14C6 14 7 4 9 4s3 10 7 10"
              stroke="#22090B"
              strokeWidth={2.2}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </View>
        <Text style={[s.word, { color: p.solid }, p.shadow]}>maraton</Text>
      </View>
      {daysToExam != null ? (
        <Text style={[TYPOGRAPHY.tableHead, s.days, { color: p.dim }, p.shadow]}>
          {`SINAVA ${daysToExam} GÜN`}
        </Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  mark: { width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  word: { fontFamily: "Bricolage_400", fontSize: 19, letterSpacing: -0.19 },
  days: { letterSpacing: 1.6 },
});
