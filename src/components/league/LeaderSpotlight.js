import { StyleSheet, Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

import { Avatar } from "../design/Avatar";
import { Icon } from "../design/Icon";
import { useC } from "../../contexts/ThemeContext";
import { alpha } from "../../themes/colorMix";
import { SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";

const AV = 72;
const RAY_W = 46;
// Avatarin iki yaninda yelpaze gibi acilan kisa isik cizgileri (lider ani).
const RAYS = [-34, -17, 0, 17, 34];

function Rays({ color, flip }) {
  return (
    <Svg width={RAY_W} height={AV} style={flip ? s.flip : null}>
      {RAYS.map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        const cx = RAY_W - 4;
        const cy = AV / 2;
        return (
          <Line key={i}
            x1={cx - Math.cos(r) * 14} y1={cy + Math.sin(r) * 14}
            x2={cx - Math.cos(r) * 34} y2={cy + Math.sin(r) * 34}
            stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeOpacity={i === 2 ? 1 : 0.7} />
        );
      })}
    </Svg>
  );
}

// Siralamanin basi: liderin fotografi isik cizgileri arasinda, buyuk sayi,
// tacli isim. Lig ve grup odasi ayni bileseni kullanir.
export function LeaderSpotlight({ leader, value, unit, caption }) {
  const C = useC();
  if (!leader) return null;
  const name = leader.you ? "Sen" : leader.name || "Öğrenci";
  const init = (leader.name || "?").slice(0, 2).toUpperCase();
  return (
    <View style={[s.card, { borderColor: alpha(C.accent, 28) }]}>
      <LinearGradient
        colors={[alpha(C.accent, 22), alpha(C.accent, 4), "transparent"]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.stage}>
        <Rays color={C.warn} />
        <View style={[s.ring, { borderColor: C.warn }]}>
          <Avatar init={init} image={leader.avatar_url} size={AV - 8} color={C.accent} />
        </View>
        <Rays color={C.warn} flip />
      </View>
      <Text style={[TYPOGRAPHY.statLarge, s.value, { color: C.text }]}>{value}</Text>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{unit}</Text>
      <View style={s.nameRow}>
        <Icon name="crown" size={16} color={C.warn} fill={alpha(C.warn, 40)} />
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]} numberOfLines={1}>{name}</Text>
      </View>
      {caption ? <Text style={[TYPOGRAPHY.caption, s.caption, { color: C.text2 }]}>{caption}</Text> : null}
    </View>
  );
}

// Tablo basligi: SIRA · OGRENCI · deger (Strava'daki gibi ince serit).
export function LeaderTableHead({ valueLabel = "SORU" }) {
  const C = useC();
  return (
    <View style={[s.head, { backgroundColor: C.surface }]}>
      <Text style={[TYPOGRAPHY.label, s.colRank, { color: C.text3 }]}>SIRA</Text>
      <Text style={[TYPOGRAPHY.label, s.colName, { color: C.text3 }]}>ÖĞRENCİ</Text>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{valueLabel}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    alignItems: "center", paddingVertical: STEP.s3, paddingHorizontal: STEP.s3,
    borderRadius: SHAPE.card, borderWidth: 1, overflow: "hidden", marginBottom: STEP.s2,
  },
  stage: { flexDirection: "row", alignItems: "center" },
  flip: { transform: [{ scaleX: -1 }] },
  ring: { width: AV, height: AV, borderRadius: AV / 2, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  value: { marginTop: STEP.s1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s1 },
  caption: { marginTop: STEP.s1, textAlign: "center" },
  head: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: STEP.s2, paddingVertical: STEP.s1,
    borderRadius: SHAPE.chip, marginBottom: STEP.s1,
  },
  colRank: { width: 44 },
  colName: { flex: 1 },
});
