import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";

import { StatBlock } from "../../../components/design/StatBlock";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { formatStudyMinutes } from "../../../domain/study/studyHistoryModel";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { HomeCTAButton } from "./HomeCTAButton";

// Ücretsiz Ana Sayfa hero'su: kendi verisi acik (bugun cozulen, kaydedilen
// sure), rota soluk ve kilitli, birincil eylem kayit.
export function HomeHeroFree({ solvedToday, dailyGoal, minutesToday, remainingToGoal, onRecord }) {
  const C = useC();
  const line = minutesToday > 0
    ? `bugün ${formatStudyMinutes(minutesToday)} kaydettin`
    : (remainingToGoal > 0 ? `hedefe ${remainingToGoal} kaldı` : "hedef tamamlandı");

  return (
    <View style={s.top}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <StatBlock label="Bugün çözülen" value={solvedToday} unit={`/${dailyGoal}`} size="hero">
          <Text style={[TYPOGRAPHY.bodyMedium, s.line, { color: C.text2 }]}>{line}</Text>
        </StatBlock>
      </Animated.View>

      <View style={s.lock} accessible accessibilityLabel="Rota önizlemesi kilitli">
        <Svg viewBox="0 0 390 150" style={[s.svg, { opacity: 0.3 }]}>
          <Path d="M 26 118 C 96 110 132 92 178 78 C 240 58 300 42 364 28" fill="none" stroke={C.accent} strokeWidth={4.5} strokeLinecap="round" />
          <Circle cx={26} cy={118} r={5} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
          <Circle cx={178} cy={78} r={8} fill={C.accent} />
          <Circle cx={364} cy={28} r={6.5} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
        </Svg>
        <View style={s.overlay}>
          <View style={[s.lockBox, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Icon name="lock" size={15} color={C.text2} />
          </View>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>ROTA ÖNİZLEMESİ</Text>
          <Text style={[TYPOGRAPHY.caption, s.lockCopy, { color: C.text2 }]}>
            Denemelerin geldikçe rotanın gidişini burada göreceksin.
          </Text>
        </View>
      </View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={s.cta}>
        <HomeCTAButton title="Bugün ne çalıştın, kaydet" subtitle="Ders · konu · süre · soru" onPress={onRecord} />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  top: { paddingTop: STEP.s3 + 2 },
  line: { marginTop: STEP.s2 + 2, fontSize: TYPOGRAPHY.bodyMedium.fontSize + 1 },
  lock: { marginTop: STEP.s3 + 6 },
  svg: { width: "100%", aspectRatio: 390 / 150 },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", gap: STEP.s2 },
  lockCopy: { maxWidth: 240, textAlign: "center" },
  lockBox: {
    width: STEP.s4, height: STEP.s4, borderRadius: SHAPE.iconBox - 1, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  cta: { marginTop: STEP.s3 + 2 },
});

