import { View, Text, StyleSheet } from "react-native";
import { BrandMark } from "../design/BrandMark";
import Svg, { Path } from "react-native-svg";

import { TYPOGRAPHY } from "../../themes/tokens";

// Etiketin altindaki marka satiri. Bu, paylasimin bize donen tek getirisi —
// her varyantta ayni yerde, ayni boyda durur ("kart" haric, onun kendi
// ayagi var).
export function StoryFoot({ p, inline = true, centered = true }) {
  return (
    <View style={[s.wrap, inline && s.inline, centered && s.centered]}>
      {/* Onayli marka: isaret + Unbounded MARATON (4 Ekim). */}
      <BrandMark width={38} word wordSize={15} color={p.solid} />
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
