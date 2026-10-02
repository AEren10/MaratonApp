import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { StoryFoot } from "../StoryFoot";
import { formatNumber } from "../../../lib/format";

const eyebrow = { fontFamily: "Archivo_700", fontSize: 11.5, letterSpacing: 1.8 };

export function StoryCountdownBody({ data, p }) {
  const pct = data.progressPct != null ? Math.max(0, Math.min(100, data.progressPct)) : null;
  const isTripleDigit = Number(data.daysToExam) >= 100;
  return (
    <View style={s.centerWrap}>
      <View style={s.cardBox}>
        <Text style={[eyebrow, { color: p.dim }, p.shadow]}>{data.examLabel.toLocaleUpperCase("tr")}</Text>
        <View style={s.countRow}>
          <Text style={[s.countHero, isTripleDigit && s.countHeroTriple, { color: p.solid }, p.shadow]}>{data.daysToExam}</Text>
          <Text style={[s.countUnit, { color: p.mid }, p.shadow]}>gün</Text>
        </View>
        {pct != null ? (
          <>
            <View style={[s.bar, { backgroundColor: p.rule }]}>
              <View style={[s.barFill, { width: `${pct}%`, backgroundColor: p.accent }]} />
            </View>
            <View style={s.countFoot}>
              {data.elapsedDays != null ? (
                <Text style={[s.meta, { color: p.dim }, p.shadow]}>{`${data.elapsedDays} GÜN GERİDE`}</Text>
              ) : <View />}
              <Text style={[s.meta, { color: p.accent }, p.shadow]}>{`%${Math.round(pct)}`}</Text>
            </View>
          </>
        ) : null}
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
        <Text style={[eyebrow, { color: p.accent }, p.shadow]}>
          {`✦ ${data.label ? data.label.toLocaleUpperCase("tr") : "DENEME NETİ"} ✦`}
        </Text>
        <View style={s.netRow}>
          <Text style={[s.netHero, isLongNet && s.netHeroCompact, { color: p.solid }, p.shadow]}>{netStr}</Text>
          <Text style={[s.netUnit, { color: p.mid }, p.shadow]}>net</Text>
        </View>
        {data.delta != null && data.delta !== 0 ? (
          <View style={[s.chip, { backgroundColor: p.upBg, borderColor: p.upBorder }]}>
            <Svg width={11} height={11} viewBox="0 0 12 12">
              <Path
                d={up ? "M6 10V2M6 2 2.4 5.6M6 2l3.6 3.6" : "M6 2v8M6 10l3.6-3.6M6 10 2.4 6.4"}
                stroke={up ? p.up : p.dim}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
            <Text style={[s.chipText, { color: up ? p.up : p.dim }]}>
              {`${formatNumber(Math.abs(data.delta), 2)} net · geçen denemeye göre`}
            </Text>
          </View>
        ) : null}
        {data.subjects?.length ? (
          <View style={s.subjGrid}>
            {data.subjects.slice(0, 4).map((n) => (
              <View key={n.key} style={[s.subjPill, { backgroundColor: "rgba(255,255,255,0.06)", borderColor: p.rule }]}>
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
        <Text style={[s.honestHero, { color: p.solid }, p.shadow]}>{`Bugün ${data.questions} soru.\nAma oturdum.`}</Text>
        <Text style={[s.honestBody, { color: p.dim }, p.shadow]}>{`Kötü günler de seride sayılır. ${data.streak} gün.`}</Text>
      </View>
      <View style={s.brandRow}><StoryFoot p={p} inline centered /></View>
    </View>
  );
}

const s = StyleSheet.create({
  centerWrap: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  cardBox: { width: 330, gap: 8 },
  countRow: { flexDirection: "row", alignItems: "flex-end", gap: 12, marginTop: 10 },
  countHero: { fontFamily: "Bricolage_400", fontSize: 140, lineHeight: 144, letterSpacing: -8 },
  countHeroTriple: { fontSize: 104, lineHeight: 110, letterSpacing: -6 },
  countUnit: { fontFamily: "Bricolage_400", fontSize: 24, paddingBottom: 18 },
  bar: { height: 6, borderRadius: 2, marginTop: 20, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 2 },
  countFoot: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  meta: { fontFamily: "Archivo_600", fontSize: 11, letterSpacing: 1.5 },
  netRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 4 },
  netHero: { fontFamily: "Bricolage_400", fontSize: 72, lineHeight: 76, letterSpacing: -3 },
  netHeroCompact: { fontSize: 56, lineHeight: 60, letterSpacing: -2 },
  netUnit: { fontFamily: "Archivo_600", fontSize: 18 },
  chip: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 8, height: 28, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1,
  },
  chipText: { fontFamily: "Archivo_600", fontSize: 11.5 },
  subjGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  subjPill: {
    width: "48%", flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, borderWidth: 1,
  },
  subjName: { fontFamily: "Archivo_600", fontSize: 11, letterSpacing: 0.8 },
  subjVal: { fontFamily: "Bricolage_400", fontSize: 15 },
  honestBar: { width: 44, height: 4, borderRadius: 2 },
  honestHero: { fontFamily: "Bricolage_400", fontSize: 36, lineHeight: 44, letterSpacing: -0.7, marginTop: 18 },
  honestBody: { fontFamily: "Archivo_400", fontSize: 14, lineHeight: 22, marginTop: 14, maxWidth: 260 },
  brandRow: { marginTop: 24, alignSelf: "center" },
});
