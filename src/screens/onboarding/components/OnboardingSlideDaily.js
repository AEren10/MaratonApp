import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
import { Icon } from "../../../components/design/Icon";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

export function OnboardingSlideDaily({ C }) {
  const reduced = useReducedMotion();
  const checked = useSharedValue(reduced ? 1 : 0);
  const xpScale = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    checked.value = withDelay(
      500,
      withTiming(1, { duration: 600, easing: Easing.bezier(0.16, 1, 0.3, 1) }, (fin) => {
        if (fin) {
          xpScale.value = withSpring(1, { damping: 12, stiffness: 220 });
        }
      })
    );
  }, [checked, xpScale, reduced]);

  const checkCircleStyle = useAnimatedStyle(() => ({
    backgroundColor: checked.value > 0.5 ? C.up : "transparent",
    borderColor: checked.value > 0.5 ? C.up : C.border,
    transform: [{ scale: 0.95 + checked.value * 0.1 }],
  }));

  const xpBadgeStyle = useAnimatedStyle(() => ({
    opacity: xpScale.value,
    transform: [{ scale: xpScale.value }],
  }));

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      {/* Kart Üst Bilgisi */}
      <View style={s.headRow}>
        <View style={s.badge}>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>BUGÜNÜN 1. DURAĞI</Text>
        </View>
        <Animated.View style={[s.xpTag, { backgroundColor: C.accentMuted || C.elev }, xpBadgeStyle]}>
          <Icon name="sparkle" size={11} color={C.accentBright} />
          <Text style={[TYPOGRAPHY.micro, { color: C.accentBright }]}>+40 XP</Text>
        </Animated.View>
      </View>

      {/* Görev Satırı */}
      <View style={[s.taskBox, { backgroundColor: C.bg, borderColor: C.line }]}>
        <View style={[s.subjectBar, { backgroundColor: "#E0A570" }]} />

        <View style={s.taskInfo}>
          <Text style={[TYPOGRAPHY.topicName, { color: C.text }]} numberOfLines={1}>
            Türev · Geometrik Yorum
          </Text>
          <View style={s.metaRow}>
            <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Matematik</Text>
            <Text style={[TYPOGRAPHY.micro, { color: C.text4 }]}>·</Text>
            <Text style={[TYPOGRAPHY.micro, { color: C.text2 }]}>45 dakika · 35 soru</Text>
          </View>
        </View>

        <Animated.View style={[s.checkCircle, checkCircleStyle]}>
          <Icon name="check" size={13} color={C.bg} />
        </Animated.View>
      </View>

      {/* İlerleme Çubuğu */}
      <View style={s.progWrap}>
        <View style={s.progLabelRow}>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Günün İlerlemesi</Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.up }]}>1/3 Tamamlandı</Text>
        </View>
        <View style={[s.progTrack, { backgroundColor: C.track }]}>
          <View style={[s.progFill, { backgroundColor: C.up, width: "33%" }]} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { width: "100%", borderRadius: SHAPE.card, borderWidth: 1, padding: STEP.s3, gap: STEP.s2 },
  headRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: SHAPE.chip },
  xpTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: SHAPE.chip },
  taskBox: { flexDirection: "row", alignItems: "center", padding: STEP.s2, borderRadius: SHAPE.cardTight, borderWidth: 1, gap: STEP.s2 },
  subjectBar: { width: 3.5, height: 38, borderRadius: 2 },
  taskInfo: { flex: 1, gap: 3 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  checkCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  progWrap: { gap: 6, paddingTop: 4 },
  progLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progFill: { height: "100%", borderRadius: 2 },
});
