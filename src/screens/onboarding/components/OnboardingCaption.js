import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { REVEAL_MS } from "./film/filmMotion";

// Sahneye eslik eden yazi. Eski ve yeni metin ust uste biner (mutlak
// konum), boylece gecis sirasinda alttaki film yerinden oynamaz.
export function OnboardingCaption({ scene, compact, C }) {
  return (
    <View style={[s.box, compact && s.boxCompact]} accessibilityLiveRegion="polite">
      <Animated.View
        key={scene.key}
        entering={FadeIn.duration(REVEAL_MS)}
        exiting={FadeOut.duration(REVEAL_MS / 2)}
        style={s.inner}
      >
        <Text style={[TYPOGRAPHY.label, s.tag, { color: C.accentBright }]}>{scene.tag}</Text>
        <Text style={[s.title, compact && s.titleCompact, { color: C.text }]}>{scene.title}</Text>
        <Text style={[TYPOGRAPHY.body, s.desc, { color: C.text2 }]}>{scene.description}</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { minHeight: 188 },
  inner: { ...StyleSheet.absoluteFillObject, gap: STEP.s1 },
  tag: { letterSpacing: 1.8 },
  title: {
    ...TYPOGRAPHY.heading,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -0.8,
  },
  titleCompact: { fontSize: 25, lineHeight: 30 },
  boxCompact: { minHeight: 160 },
  desc: { maxWidth: 340 },
});
