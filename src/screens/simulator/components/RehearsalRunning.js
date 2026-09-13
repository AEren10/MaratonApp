import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Button } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";
import { formatDuration } from "../../../lib/format";

// Prova suruyor: kalan sure kahraman sayi olarak, altinda ince ilerleme
// hatti. Renk durum anlatmaz (kirmizi/yesil geri sayim yok); tek vurgu hat.
export function RehearsalRunning({ session, remaining, total, onFinish }) {
  const C = useC();
  const progress = total ? Math.min(1, (total - remaining) / total) : 0;
  return (
    <Animated.View entering={FadeIn.duration(500)} style={s.wrap}>
      <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>{session.key} · PROVA</Text>
      <Text style={[TYPOGRAPHY.statHero, s.clock, { color: C.text }]} allowFontScaling={false} adjustsFontSizeToFit numberOfLines={1}>
        {formatDuration(remaining)}
      </Text>
      <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>kalan süre</Text>
      <View style={[s.track, { backgroundColor: C.track }]}>
        <View style={[s.fill, { width: `${progress * 100}%`, backgroundColor: C.accent }]} />
      </View>
      <View style={s.cta}>
        <Button variant="outline" size="lg" fullWidth onPress={onFinish}>Bitir</Button>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: GUTTER, paddingTop: STEP.s5 },
  clock: { marginTop: STEP.s3 },
  track: { height: 4, borderRadius: 2, marginTop: STEP.s4, overflow: "hidden" },
  fill: { height: 4 },
  cta: { marginTop: "auto", paddingBottom: STEP.s4 },
});
