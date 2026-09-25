import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";

export function OnboardingSlideItem({ tag, title, description, children, C }) {
  return (
    <View style={s.slide}>
      <View style={s.header}>
        {tag ? (
          <Text style={[TYPOGRAPHY.label, { color: C.accentBright, letterSpacing: 1.8 }]}>
            {tag}
          </Text>
        ) : null}
        <Text style={[s.title, { color: C.text }]}>{title}</Text>
        <Text style={[TYPOGRAPHY.body, s.desc, { color: C.text2 }]}>
          {description}
        </Text>
      </View>

      <View style={s.visualBox}>
        {children}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  slide: {
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2,
    justifyContent: "space-between",
  },
  header: {
    gap: STEP.s1,
    paddingBottom: STEP.s2,
  },
  title: {
    ...TYPOGRAPHY.heading,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
    marginTop: 4,
  },
  desc: {
    lineHeight: 22,
    marginTop: 2,
    maxWidth: 320,
  },
  visualBox: {
    marginTop: STEP.s3,
    alignItems: "center",
    justifyContent: "center",
  },
});
