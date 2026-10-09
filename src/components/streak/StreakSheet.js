import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { CenterCard } from "../design/CenterCard";
import { CountUpText } from "../design/CountUpText";
import { Icon } from "../design/Icon";
import { useC } from "../../contexts/ThemeContext";
import { getNextMilestone } from "../../lib/streakMilestones";
import { ANIMATION, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { StreakDots } from "./StreakDots";
import { LiveFlame } from "./LiveFlame";

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
      {/* Canli alev + sayi yan yana (kahverengi diskteki duz ikon bulaniktı).
          Alev acilista birkac kez yanip durur: surekli dongu yok (performans). */}
      <View style={s.hero}>
        <View style={s.heroRow}>
          <LiveFlame size={64} animate={visible} cycles={3} />
          <CountUpText value={week.value} style={[TYPOGRAPHY.statHero, { color: C.text }]} />
        </View>
        <Text style={[TYPOGRAPHY.label, { color: C.flame }]}>GÜN ÜST ÜSTE</Text>
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

      {/* Alt bilgi tek satir: solda joker, sagda en uzun seri (yalniz
          bugunkunden buyukse; esitken ustteki sayiyi tekrarliyordu). */}
      <View style={[s.foot, { borderTopColor: C.line }]}>
        <View style={s.jokerRow}>
          <Icon name="shield" size={16} color={week.freeze > 0 ? C.up : C.text3} />
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>
            {week.freeze > 0 ? "Joker hazır" : "Joker kullanıldı"}
          </Text>
        </View>
        {week.longest > week.value ? (
          <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>
            {"En uzun "}<Text style={{ color: C.text }}>{`${week.longest} gün`}</Text>
          </Text>
        ) : null}
      </View>
      <Text style={[TYPOGRAPHY.caption, s.note, { color: C.text3 }]}>
        {week.freeze > 0
          ? "Bir gün atlarsan joker seriyi korur. Bir durak ya da çalışma kaydı o günü sayar."
          : `${week.jokerLine} Bir durak ya da çalışma kaydı o günü sayar.`}
      </Text>
    </CenterCard>
  );
}

const s = StyleSheet.create({
  sheet: { borderRadius: SHAPE.sheet, padding: STEP.s3, gap: STEP.s1 },
  hero: { alignItems: "center" },
  heroRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  line: { marginTop: STEP.s2 },
  center: { textAlign: "center" },
  week: { flexDirection: "row", marginVertical: STEP.s3 },
  block: { gap: STEP.s1 },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 3 },
  foot: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginTop: STEP.s3, paddingTop: STEP.s3, borderTopWidth: 1,
  },
  jokerRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  note: { marginTop: STEP.s1, textAlign: "center" },
});
