import { View, StyleSheet } from "react-native";
import { BrandMark } from "../design/BrandMark";

// Etiketin altindaki marka satiri. Icon ve isim kibar olcekli, isim ana kirmizi tonunda.
export function StoryFoot({ p, inline = true, centered = true }) {
  return (
    <View style={[inline ? s.inline : s.wrap, centered && s.centered]}>
      {/* Onayli marka: isaret + Unbounded MARATON */}
      <BrandMark width={26} word wordSize={11} color={p.accent || "#E5343F"} />
    </View>
  );
}

const s = StyleSheet.create({
  inline: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  wrap: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  centered: { alignSelf: "center", justifyContent: "center" },
});

