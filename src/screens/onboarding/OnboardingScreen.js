import { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown, FadeIn, ZoomIn,
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from "react-native-reanimated";
import Svg, { Circle, Path, Polyline, Line } from "react-native-svg";

import { TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { Icon, AnimatedPressable, Button } from "../../components/design";

// Decorative gradient tail colors for onboarding slides
const TAIL_PEACH = "#FFC9A8";
const TAIL_BLUE  = "#A6CCFF";
const TAIL_GREEN = "#7CD8A8";

const SLIDES = [
  {
    icon: "target",
    gradientKey: "accent",
    tail: TAIL_PEACH,
    title: "Hedefe Odaklan",
    desc: "Yapay zeka destekli kişisel çalışma planın, her gün seni hedefe yaklaştırır.",
  },
  {
    icon: "chart",
    gradientKey: "blue",
    tail: TAIL_BLUE,
    title: "Gelişimini Takip Et",
    desc: "Deneme sonuçların, ders bazlı analizler ve trend grafikleri tek yerde.",
  },
  {
    icon: "flame",
    gradientKey: "coral",
    tail: TAIL_PEACH,
    title: "Seri Oluştur",
    desc: "Günlük çalışma serini koru, rozet kazan ve ligde yüksel.",
  },
  {
    icon: "users",
    gradientKey: "green",
    tail: TAIL_GREEN,
    title: "Birlikte Çalış",
    desc: "Gruplarına katıl, arkadaşlarınla yarışarak motive ol.",
  },
];

function SlideIcon({ name, size = 120, color = "#FFFFFF" }) {
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
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {ICON_MAP[name]}
    </Svg>
  );
}

export default function OnboardingScreen() {
  const C = useC();
  const { markSlidesAsSeen } = useExam();
  const [index, setIndex] = useState(0);

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;
  const grad = [C[slide.gradientKey] || C.accent, slide.tail];

  // İkon yüzme + dekoratif nokta nabzı
  const float = useSharedValue(0);
  const pulse = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(withSequence(
      withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 1700, easing: Easing.inOut(Easing.quad) })
    ), -1, false);
    pulse.value = withRepeat(withSequence(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.quad) })
    ), -1, false);
  }, []);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -9 * float.value }] }));
  const pulseStyle = useAnimatedStyle(() => ({ opacity: 0.25 + pulse.value * 0.5, transform: [{ scale: 0.85 + pulse.value * 0.3 }] }));

  const goNext = useCallback(() => {
    if (isLast) {
      markSlidesAsSeen();
    } else {
      setIndex((i) => i + 1);
    }
  }, [isLast, markSlidesAsSeen]);

  const skip = useCallback(() => {
    markSlidesAsSeen();
  }, [markSlidesAsSeen]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* Skip butonu */}
        <View style={styles.topRow}>
          <View />
          <Pressable onPress={skip} hitSlop={12} style={({ pressed }) => ({
            paddingHorizontal: 14, paddingVertical: 7,
            borderRadius: 999,
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.border,
            opacity: pressed ? 0.7 : 1,
          })}>
            <Text style={{ ...TYPOGRAPHY.micro, fontFamily: "Inter_600SemiBold", fontSize: 12, color: C.muted, letterSpacing: 0.4 }}>
              Atla
            </Text>
          </Pressable>
        </View>

        {/* === Hero illustration === */}
        <Animated.View
          key={`hero-${index}`}
          entering={FadeIn.duration(420)}
          style={{ alignItems: "center", marginTop: 20, marginBottom: 30, paddingHorizontal: 30 }}
        >
          <LinearGradient
            colors={grad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 240, height: 240, borderRadius: 60,
              alignItems: "center", justifyContent: "center",
              shadowColor: grad[0],
              shadowOffset: { width: 0, height: 18 },
              shadowOpacity: 0.40,
              shadowRadius: 30,
              elevation: 12,
              overflow: "hidden",
            }}
          >
            {/* Decorative blobs inside */}
            <View style={{
              position: "absolute", top: -40, left: -40,
              width: 140, height: 140, borderRadius: 70,
              backgroundColor: "rgba(255,255,255,0.18)",
            }} />
            <View style={{
              position: "absolute", bottom: -50, right: -30,
              width: 120, height: 120, borderRadius: 60,
              backgroundColor: "rgba(255,255,255,0.10)",
            }} />

            {/* Nabız atan dekoratif noktalar */}
            <Animated.View style={[{ position: "absolute", top: 34, right: 40, width: 14, height: 14, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.85)" }, pulseStyle]} />
            <Animated.View style={[{ position: "absolute", bottom: 46, left: 36, width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.7)" }, pulseStyle]} />
            <Animated.View style={[{ position: "absolute", top: 60, left: 30, width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.6)" }, pulseStyle]} />

            <Animated.View key={`icon-${index}`} entering={ZoomIn.springify().damping(13)} style={floatStyle}>
              <SlideIcon name={slide.icon} size={120} color={C.textOnFill} />
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* === Text content === */}
        <Animated.View
          key={`text-${index}`}
          entering={FadeInDown.delay(120).duration(420)}
          style={{ paddingHorizontal: 32, alignItems: "center" }}
        >
          <Text style={[styles.slideTitle, { color: C.text }]}>{slide.title}</Text>
          <Text style={[styles.slideDesc, { color: C.muted }]}>{slide.desc}</Text>
        </Animated.View>

        <View style={{ flex: 1 }} />

        {/* === Dots + CTA === */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 30 }}>
          <View style={styles.dots}>
            {SLIDES.map((s, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === index ? (C[s.gradientKey] || C.accent) : C.border },
                  i === index && { width: 28 },
                ]}
              />
            ))}
          </View>

          <Button onPress={goNext} iconRight="arrowR" size="lg" fullWidth>
            {isLast ? "Başlayalım" : "Devam"}
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  slideTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 30,
    letterSpacing: -0.8,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  slideDesc: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  dots: {
    flexDirection: "row", justifyContent: "center", gap: 6,
    marginBottom: SPACING.xxl,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
  },
});
