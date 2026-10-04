import { Image, StyleSheet, Text, View } from "react-native";

const MARK = require("../../../assets/brand/mark.png");
const RATIO = 398 / 859; // assets/brand/mark.png en-boy

// Onayli marka (4 Ekim): isaret (secenek 1) + istege bagli MARATON yazisi
// (Unbounded SemiBold, buyuk harf, genis aralik). Logo/ad gorunen her yerde
// bu kullanilir; uygulama ici metin fontu degismez.
export function BrandMark({ width = 40, word = false, wordSize, color, direction = "row", style }) {
  const size = wordSize || Math.round(width * 0.42);
  return (
    <View style={[direction === "row" ? s.row : s.col, { gap: Math.round(width * 0.22) }, style]}
      accessible accessibilityRole="image" accessibilityLabel="Maraton">
      <Image source={MARK} style={{ width, height: Math.round(width * RATIO) }} resizeMode="contain" />
      {word ? (
        <Text style={[s.word, { fontSize: size, letterSpacing: size * 0.08, color }]}>MARATON</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  col: { alignItems: "center" },
  word: { fontFamily: "Unbounded_600" },
});
