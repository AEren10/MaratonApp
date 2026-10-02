import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

import { TYPOGRAPHY } from "../../themes/tokens";

// Etiketin altindaki marka satiri. Bu, paylasimin bize donen tek getirisi —
// her varyantta ayni yerde, ayni boyda durur ("kart" haric, onun kendi
// ayagi var).
export function StoryFoot({ p, inline = true, centered = true }) {
  return (
    <View style={[s.wrap, inline && s.inline, centered && s.centered]}>
      <View style={s.brand}>
        <View style={[s.mark, { backgroundColor: p.accent }]}>
          <Svg width={16} height={16} viewBox="0 0 18 18">
            <Path
              d="M2 14C6 14 7 4 9 4s3 10 7 10"
              stroke={p.markInk}
              strokeWidth={2.4}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </View>
        <Text style={[s.word, { color: p.solid }, p.shadow]}>maraton</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  inline: { position: "relative", left: "auto", right: "auto", bottom: "auto" },
  centered: { alignSelf: "center", justifyContent: "center" },
  wrap: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  mark: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  word: { fontFamily: "Bricolage_400", fontSize: 18, letterSpacing: -0.2 },
});
