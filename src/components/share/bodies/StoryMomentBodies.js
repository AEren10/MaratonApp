import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { StoryFoot } from "../StoryFoot";
import { formatNumber } from "../../../lib/format";

export function StoryCountdownBody({ data, p }) {
  const pct = data.progressPct != null ? Math.max(0, Math.min(100, data.progressPct)) : null;
  const isTripleDigit = Number(data.daysToExam) >= 100;
  return (
    <View style={s.centerWrap}>
      <View style={s.cardBox}>
        <Text style={[s.countLabel, { color: p.accent }, p.shadow]}>
          {(data.examLabel || "YKS").toLocaleUpperCase("tr")}
        </Text>
        <View style={s.countRow}>
          <Text style={[s.countHero, isTripleDigit && s.countHeroTriple, { color: p.solid }, p.shadow]}>{data.daysToExam}</Text>
          <Text style={[s.countUnit, { color: p.mid }, p.shadow]}>GÜN KALDI</Text>
        </View>
        {pct != null ? (
          <View style={s.barArea}>
            <View style={[s.barTrack, { backgroundColor: p.track }]}>
              <View style={[s.barFill, { width: `${pct}%`, backgroundColor: p.accent }]} />
            </View>
            <View style={s.barMeta}>
              <Text style={[s.metaText, { color: p.dim }, p.shadow]}>{`%${Math.round(pct)} Geride Kaldı`}</Text>
              <Text style={[s.metaText, { color: p.up }, p.shadow]}>Hedefe Odaklan</Text>
            </View>
          </View>
        ) : null}
        <Text style={[s.motto, { color: p.mid }, p.shadow]}>
          Her gün hedefe bir adım daha yakın.
        </Text>
      </View>
      <View style={s.brandRow}><StoryFoot p={p} inline centered /></View>
    </View>
  );
}

export function StoryNetBody({ data, p }) {
  const up = data.delta != null && data.delta > 0;
  const netStr = formatNumber(data.net, 2);
  const isLongNet = netStr.length >= 5;
  return (
    <View style={s.centerWrap}>
      <View style={s.cardBox}>
        <View style={s.netRow}>
          <Text style={[s.netHero, isLongNet && s.netHeroCompact, { color: p.solid }, p.shadow]}>{netStr}</Text>
          <Text style={[s.netUnit, { color: p.mid }, p.shadow]}>NET</Text>
        </View>

        {data.delta != null && data.delta !== 0 ? (
          <View style={s.deltaRow}>
            <Svg width={12} height={12} viewBox="0 0 12 12">
              <Path
                d={up ? "M6 10V2M6 2 2.4 5.6M6 2l3.6 3.6" : "M6 2v8M6 10l3.6-3.6M6 10 2.4 6.4"}
                stroke={up ? p.up : p.dim}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
            <Text style={[s.deltaText, { color: up ? p.up : p.dim }, p.shadow]}>
              {`${formatNumber(Math.abs(data.delta), 2)} net · son denemeye göre`}
            </Text>
          </View>
        ) : null}

        {data.subjects?.length ? (
          <View style={s.subjGrid}>
            {data.subjects.slice(0, 4).map((n) => (
              <View key={n.key} style={[s.subjPill, { backgroundColor: p.track, borderColor: p.rule }]}>
                <Text style={[s.subjName, { color: p.mid }, p.shadow]} numberOfLines={1}>
                  {String(n.key).slice(0, 10)}
                </Text>
                <Text style={[s.subjVal, { color: p.solid }, p.shadow]}>
                  {`${formatNumber(n.net, 2)}`}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={s.brandRow}><StoryFoot p={p} inline centered /></View>
    </View>
  );
}

export function StoryHonestBody({ data, p }) {
  return (
    <View style={s.centerWrap}>
      <View style={s.cardBox}>
        <View style={[s.honestBar, { backgroundColor: p.accent }]} />
        <Text style={[s.honestHero, { color: p.solid }, p.shadow]}>{`Bugün ${data.questions || 30} soru.\nAma masaya oturdum.`}</Text>
        <Text style={[s.honestBody, { color: p.mid }, p.shadow]}>{`Kötü günler de sürece dahil. ${data.streak || 6} gündür aralıksız.`}</Text>
      </View>
      <View style={s.brandRow}><StoryFoot p={p} inline centered /></View>
    </View>
  );
}

const s = StyleSheet.create({
  centerWrap: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  cardBox: { width: 330, gap: 6 },
  countLabel: { fontFamily: "Archivo_700", fontSize: 13, letterSpacing: 1.8 },
  countRow: { flexDirection: "row", alignItems: "baseline", gap: 10, marginTop: 4 },
  countHero: { fontFamily: "Bricolage_400", fontSize: 110, lineHeight: 114, letterSpacing: -6 },
  countHeroTriple: { fontSize: 84, lineHeight: 88, letterSpacing: -4 },
  countUnit: { fontFamily: "Archivo_700", fontSize: 14, letterSpacing: 1.2 },
  barArea: { marginTop: 14, gap: 6 },
  barTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
  barMeta: { flexDirection: "row", justifyContent: "space-between" },
  metaText: { fontFamily: "Archivo_600", fontSize: 11.5 },
  motto: { fontFamily: "Archivo_500", fontSize: 13, marginTop: 12, fontStyle: "italic" },
  netRow: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  netHero: { fontFamily: "Bricolage_400", fontSize: 76, lineHeight: 80, letterSpacing: -3 },
  netHeroCompact: { fontSize: 60, lineHeight: 64, letterSpacing: -2 },
  netUnit: { fontFamily: "Archivo_700", fontSize: 18, letterSpacing: 1.2 },
  deltaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  deltaText: { fontFamily: "Archivo_600", fontSize: 12.5 },
  subjGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  subjPill: {
    width: "48%", flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1,
  },
  subjName: { fontFamily: "Archivo_600", fontSize: 12 },
  subjVal: { fontFamily: "Bricolage_400", fontSize: 16 },
  honestBar: { width: 44, height: 4, borderRadius: 2 },
  honestHero: { fontFamily: "Bricolage_400", fontSize: 38, lineHeight: 46, letterSpacing: -0.7, marginTop: 18 },
  honestBody: { fontFamily: "Archivo_500", fontSize: 15, lineHeight: 23, marginTop: 14 },
  brandRow: { marginTop: 28, alignSelf: "center" },
});
