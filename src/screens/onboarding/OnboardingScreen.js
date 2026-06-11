import { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Circle, Path, Polyline, Line } from "react-native-svg";

import { C, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";

const SLIDES = [
  {
    icon: "target",
    color: C.amber,
    title: "Hedefe Odaklan",
    desc: "Yapay zeka destekli kisisel calisma planin, her gun seni hedefe yaklastirir.",
  },
  {
    icon: "chart",
    color: C.green,
    title: "Gelisimini Takip Et",
    desc: "Deneme sonuclarin, ders bazli analizler ve trend grafikleri tek yerde.",
  },
  {
    icon: "flame",
    color: "#EF4444",
    title: "Seri Olustur",
    desc: "Gunluk calisma serini koru, rozet kazan ve ligde yuksel.",
  },
  {
    icon: "users",
    color: C.purple,
    title: "Birlikte Calis",
    desc: "Canli calisma odalarina katil, arkadaslarinla yarisarak motive ol.",
  },
];

function SlideIcon({ name, color, size = 80 }) {
  const ICON_MAP = {
    target: (
      <>
        <Circle cx="40" cy="40" r="30" stroke={color} strokeWidth="3" fill="none" />
        <Circle cx="40" cy="40" r="18" stroke={color} strokeWidth="3" fill="none" />
        <Circle cx="40" cy="40" r="6" fill={color} />
      </>
    ),
    chart: (
      <>
        <Line x1="10" y1="65" x2="70" y2="65" stroke={color} strokeWidth="3" />
        <Polyline points="15,50 30,35 45,42 65,20" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="65" cy="20" r="4" fill={color} />
      </>
    ),
    flame: (
      <Path
        d="M40 10 C40 25 50 30 50 42 C50 52 45 58 40 60 C35 58 30 52 30 42 C30 35 35 30 38 24 C36 30 34 35 34 42 C34 48 37 54 40 56 C43 54 46 48 46 42 C46 32 40 25 40 10Z"
        fill={color}
      />
    ),
    users: (
      <>
        <Circle cx="30" cy="28" r="10" stroke={color} strokeWidth="3" fill="none" />
        <Path d="M15 58 C15 48 22 42 30 42 C38 42 45 48 45 58" stroke={color} strokeWidth="3" fill="none" />
        <Circle cx="52" cy="28" r="8" stroke={color} strokeWidth="3" fill="none" opacity="0.6" />
        <Path d="M42 55 C42 47 47 42 52 42 C57 42 62 47 62 55" stroke={color} strokeWidth="3" fill="none" opacity="0.6" />
      </>
    ),
  };
  return (
    <View style={[styles.iconContainer, { backgroundColor: color + "15" }]}>
      <Svg width={size} height={size} viewBox="0 0 80 80">
        {ICON_MAP[name]}
      </Svg>
    </View>
  );
}

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      navigation.replace(SCREENS.EXAM_SETUP);
    } else {
      setIndex((i) => i + 1);
    }
  }, [isLast, navigation]);

  const skip = useCallback(() => {
    navigation.replace(SCREENS.EXAM_SETUP);
  }, [navigation]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <View style={styles.topRow}>
        <View />
        <Pressable onPress={skip} hitSlop={12}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.muted }]}>Atla</Text>
        </Pressable>
      </View>

      <View style={styles.slideArea}>
        <SlideIcon name={slide.icon} color={slide.color} />
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDesc}>{slide.desc}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === index && { width: 24, backgroundColor: s.color },
            ]}
          />
        ))}
      </View>

      <Pressable onPress={goNext} style={styles.nextBtn}>
        <Text style={[TYPOGRAPHY.button, { color: C.bg }]}>
          {isLast ? "Baslayalim" : "Devam"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  topRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  slideArea: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: SPACING.xxxl,
  },
  iconContainer: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: "center", justifyContent: "center", marginBottom: SPACING.xxxl,
  },
  slideTitle: {
    ...TYPOGRAPHY.heading, color: C.text, textAlign: "center", marginBottom: SPACING.md,
  },
  slideDesc: {
    ...TYPOGRAPHY.body, color: C.sec, textAlign: "center", lineHeight: 24,
    maxWidth: 300,
  },
  dots: {
    flexDirection: "row", justifyContent: "center", gap: 8,
    marginBottom: SPACING.xxxl,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: C.surface2,
  },
  nextBtn: {
    backgroundColor: C.amber, borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.lg, marginBottom: SPACING.lg,
    paddingVertical: SPACING.lg, alignItems: "center",
    ...SHADOWS.amber,
  },
});
