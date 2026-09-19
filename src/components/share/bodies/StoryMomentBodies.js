import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

import { formatNumber } from "../../../lib/format";

const eyebrow = { fontFamily: "Archivo_600", fontSize: 12, letterSpacing: 2.6 };

// GERİ SAYIM — sinava kalan gun. Ilerleme cubugu gecen sureyi gosterir.
export function StoryCountdownBody({ data, p }) {
  const pct = data.progressPct != null ? Math.max(0, Math.min(100, data.progressPct)) : null;
  return (
    <View style={s.countWrap}>
      <Text style={[eyebrow, { color: p.dim }, p.shadow]}>{data.examLabel.toLocaleUpperCase("tr")}</Text>
      <View style={s.countRow}>
        <Text style={[s.countHero, { color: p.solid }, p.shadow]}>{data.daysToExam}</Text>
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
  );
}

// NET — deneme sonrasi. Mutlak net ve bir onceki denemeye gore fark.
export function StoryNetBody({ data, p }) {
  const up = data.delta != null && data.delta > 0;
  return (
    <View style={s.netWrap}>
      {data.label ? (
        <Text style={[eyebrow, { color: p.dim }, p.shadow]}>{data.label.toLocaleUpperCase("tr")}</Text>
      ) : null}
      <View style={s.netRow}>
        <Text style={[s.netHero, { color: p.solid }, p.shadow]}>{formatNumber(data.net, 2)}</Text>
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

      {data.subjects.length ? (
        <>
          <View style={[s.netRule, { backgroundColor: p.rule }]} />
          <View style={s.netSubjects}>
            {data.subjects.slice(0, 4).map((n) => (
              <View key={n.key} style={s.netSubject}>
                <Text style={[s.netSubjectKey, { color: p.dim }, p.shadow]}>
                  {String(n.key).toLocaleUpperCase("tr")}
                </Text>
                <Text style={[s.netSubjectValue, { color: p.solid }, p.shadow]}>
                  {formatNumber(n.net, 2)}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

// DÜRÜST — az calisilmis gun. Seriyi kirmadigini soyler, sayiyi saklamaz.
export function StoryHonestBody({ data, p }) {
  return (
    <View style={s.honestWrap}>
      <View style={[s.honestBar, { backgroundColor: p.accent }]} />
      <Text style={[s.honestHero, { color: p.solid }, p.shadow]}>
        {`Bugün ${data.questions} soru.\nAma oturdum.`}
      </Text>
      <Text style={[s.honestBody, { color: p.dim }, p.shadow]}>
        {`Kötü günler de seride sayılır. ${data.streak} gün.`}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  countWrap: { position: "absolute", left: 36, right: 36, top: 196 },
  countRow: { flexDirection: "row", alignItems: "flex-end", gap: 16, marginTop: 18 },
  countHero: { fontFamily: "Bricolage_400", fontSize: 210, lineHeight: 155, letterSpacing: -14.7 },
  countUnit: { fontFamily: "Bricolage_400", fontSize: 30, paddingBottom: 26 },
  bar: { height: 6, borderRadius: 2, marginTop: 34, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 2 },
  countFoot: { flexDirection: "row", justifyContent: "space-between", marginTop: 11 },
  meta: { fontFamily: "Archivo_600", fontSize: 10.5, letterSpacing: 1.7 },

  netWrap: { position: "absolute", left: 36, right: 36, top: 182 },
  netRow: { flexDirection: "row", alignItems: "flex-end", gap: 14, marginTop: 16 },
  netHero: { fontFamily: "Bricolage_400", fontSize: 138, lineHeight: 105, letterSpacing: -8 },
  netUnit: { fontFamily: "Bricolage_400", fontSize: 26, paddingBottom: 16 },
  chip: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7,
    marginTop: 20, height: 30, paddingHorizontal: 13, borderRadius: 6, borderWidth: 1,
  },
  chipText: { fontFamily: "Archivo_600", fontSize: 13 },
  netRule: { height: 1, marginTop: 26 },
  netSubjects: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  netSubject: { gap: 6 },
  netSubjectKey: { fontFamily: "Archivo_600", fontSize: 10, letterSpacing: 1.4 },
  netSubjectValue: { fontFamily: "Bricolage_400", fontSize: 24, lineHeight: 24 },

  honestWrap: { position: "absolute", left: 40, right: 40, top: 236 },
  honestBar: { width: 52, height: 4, borderRadius: 2 },
  honestHero: { fontFamily: "Bricolage_400", fontSize: 44, lineHeight: 55, letterSpacing: -0.88, marginTop: 28 },
  honestBody: { fontFamily: "Archivo_400", fontSize: 15, lineHeight: 24, marginTop: 24, maxWidth: 250 },
});
