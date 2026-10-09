import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { CenterCard } from "../design/CenterCard";
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
    <CenterCard visible={visible} onClose={onClose} style={s.sheet}>
      {/* Sayi ve birimi tek eksende: birim eskiden sayinin yaninda, tabanindan
          kopuk duruyordu. Alev tek yumusak halkada. */}
      <View style={s.hero}>
        <View style={[s.halo, { backgroundColor: alpha(C.flame, 14) }]}>
          <Icon name="flame" size={28} color={C.flame} fill={C.flame} />
        </View>
        <CountUpText value={week.value} style={[TYPOGRAPHY.statHero, s.number, { color: C.text }]} />
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>GÜN ÜST ÜSTE</Text>
        <Text style={[TYPOGRAPHY.body, s.center, s.line, { color: C.text2 }]}>{week.line}</Text>
      </View>

      <View style={s.week}><StreakDots days={week.days} size={26} flame /></View>

      {next ? (
        <View style={s.block}>
          <View style={s.between}>
            <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{`SIRADAKİ EŞİK · ${next.day} GÜN`}</Text>
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.flame }]}>{`${next.daysLeft} gün kaldı`}</Text>
          </View>
          <View style={[s.track, { backgroundColor: C.track }]}>
            <Animated.View style={[s.fill, { backgroundColor: C.flame }, fillStyle]} />
          </View>
        </View>
      ) : null}

      {/* Kutusuz alt bilgi: joker tek satir; en uzun seri yalniz bugunkunden
          buyukse (esitken ustteki buyuk sayiyi tekrarliyordu). */}
      <View style={[s.foot, { borderTopColor: C.line }]}>
        <View style={s.jokerRow}>
          <Icon name="shield" size={16} color={week.freeze > 0 ? C.up : C.text3} />
          <Text style={[TYPOGRAPHY.caption, s.flex, { color: C.text2 }]}>{week.jokerLine}</Text>
        </View>
        {week.longest > week.value ? (
          <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>{`En uzun serin: ${week.longest} gün`}</Text>
        ) : null}
        <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>
          Bir durak ya da bir çalışma kaydı o günü sayar.
        </Text>
      </View>
    </CenterCard>
  );
}

const s = StyleSheet.create({
  sheet: { borderRadius: SHAPE.sheet, padding: STEP.s3, gap: STEP.s1 },
  hero: { alignItems: "center" },
  halo: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  number: { marginTop: STEP.s1 },
  line: { marginTop: STEP.s2 },
  center: { textAlign: "center" },
  week: { flexDirection: "row", marginVertical: STEP.s3 },
  block: { gap: STEP.s1 },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 3 },
  foot: { marginTop: STEP.s3, paddingTop: STEP.s3, borderTopWidth: 1, gap: STEP.s1 },
  jokerRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  flex: { flex: 1 },
});
