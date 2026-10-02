import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { BottomSheet } from "../design/BottomSheet";
import { CountUpText } from "../design/CountUpText";
import { Icon } from "../design/Icon";
import { useC } from "../../contexts/ThemeContext";
import { alpha } from "../../themes/colorMix";
import { getNextMilestone } from "../../lib/streakMilestones";
import { ANIMATION, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { StreakDots } from "./StreakDots";

const EASE = Easing.bezier(...ANIMATION.easing.easeOut);

// SERI PANELI: parlayan halkada alev + sayarak gelen sayi, haftanin alevli
// gunleri, siradaki esige dolan cizgi, kutusuz iki bilgi. Konfeti/rozet yok.
export function StreakSheet({ visible, onClose, week }) {
  const C = useC();
  const reduced = useReducedMotion();
  const next = week ? getNextMilestone(week.value) : null;
  const share = next ? Math.min(1, week.value / next.day) : 1;
  const fill = useSharedValue(0);
  useEffect(() => {
    if (!visible) { fill.set(0); return; }
    fill.set(reduced ? share : withDelay(250, withTiming(share, { duration: 700, easing: EASE })));
  }, [visible, share, reduced, fill]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.get() * 100}%` }));
  if (!week) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} style={s.sheet}>
      <View style={s.hero}>
        <View style={[s.halo, { backgroundColor: alpha(C.accent, 10) }]}>
          <View style={[s.ring, { backgroundColor: alpha(C.accent, 18), borderColor: alpha(C.accent, 45) }]}>
            <Icon name="flame" size={30} color={C.accent} fill={C.accent} />
          </View>
        </View>
        <View style={s.numberRow}>
          <CountUpText value={week.value} style={[TYPOGRAPHY.statHero, { color: C.text }]} />
          <Text style={[TYPOGRAPHY.statSideUnit, s.unit, { color: C.text2 }]}>gün üst üste</Text>
        </View>
        <Text style={[TYPOGRAPHY.body, s.center, { color: C.text2 }]}>{week.line}</Text>
      </View>

      <View style={s.week}><StreakDots days={week.days} size={26} flame /></View>

      {next ? (
        <View style={s.block}>
          <View style={s.between}>
            <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{`SIRADAKİ EŞİK · ${next.day} GÜN`}</Text>
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.accentText }]}>{`${next.daysLeft} gün kaldı`}</Text>
          </View>
          <View style={[s.track, { backgroundColor: C.track }]}>
            <Animated.View style={[s.fill, { backgroundColor: C.accent }, fillStyle]} />
          </View>
        </View>
      ) : null}

      <View style={[s.stats, { borderTopColor: C.line }]}>
        <View style={s.stat}>
          <Text style={[TYPOGRAPHY.statSmall, { color: C.text }]}>{week.longest}</Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>en uzun seri</Text>
        </View>
        <View style={[s.divider, { backgroundColor: C.line }]} />
        <View style={s.stat}>
          <View style={s.jokerRow}>
            <Icon name="shield" size={16} color={week.freeze > 0 ? C.up : C.text3} />
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{week.freeze > 0 ? "Hazır" : "Kullanıldı"}</Text>
          </View>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>joker</Text>
        </View>
      </View>
      <Text style={[TYPOGRAPHY.caption, s.note, { color: C.text3 }]}>
        {`${week.jokerLine} Bir durak ya da bir çalışma kaydı o günü sayar.`}
      </Text>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  sheet: { borderRadius: SHAPE.sheet, padding: STEP.s3, gap: STEP.s1 },
  hero: { alignItems: "center", gap: STEP.s1 },
  halo: { width: 92, height: 92, borderRadius: 46, alignItems: "center", justifyContent: "center" },
  ring: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  numberRow: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s1 },
  unit: { paddingBottom: STEP.s2 },
  center: { textAlign: "center" },
  week: { flexDirection: "row", marginVertical: STEP.s3 },
  block: { gap: STEP.s1 },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 3 },
  stats: { flexDirection: "row", alignItems: "center", marginTop: STEP.s3, paddingTop: STEP.s3, borderTopWidth: 1 },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  divider: { width: 1, height: 36 },
  jokerRow: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 32 },
  note: { marginTop: STEP.s2, textAlign: "center" },
});
