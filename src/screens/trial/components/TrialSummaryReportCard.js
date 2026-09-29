import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../../../components/design";
import { alpha } from "../../../themes/palette";
import { GUTTER, STEP, SHAPE, TYPOGRAPHY } from "../../../themes/tokens";
import { formatDelta, formatNumber, formatNet } from "../../../lib/format";

export function TrialSummaryReportCard({ C, typeLabel, dayMonth, net, prevNet, delta, sentence, bars = [] }) {
  const tone = delta > 0 ? C.up : delta < 0 ? C.down : C.text3;

  return (
    <View style={styles.wrap}>
      <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
        <LinearGradient colors={[alpha(C.accent, 10), "transparent"]} style={styles.cardSheen} pointerEvents="none" />

        {/* Rapor Ust Basligi */}
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: C.void, borderColor: C.elev }]}>
            <View style={[styles.dot, { backgroundColor: C.accent }]} />
            <Text style={[TYPOGRAPHY.tableHead, styles.badgeText, { color: C.text2 }]}>
              {`${typeLabel} RAPORU`.toLocaleUpperCase("tr-TR")}
            </Text>
          </View>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{dayMonth}</Text>
        </View>

        {/* Hero Net Alani */}
        <View style={styles.scoreWrap}>
          <View style={styles.scoreRow}>
            <Text style={[TYPOGRAPHY.heroNumber, styles.heroNet, { color: C.text }]}>{formatNumber(net, 2)}</Text>
            {delta != null ? (
              <View style={[styles.deltaBadge, { backgroundColor: C.void, borderColor: C.elev }]}>
                {delta !== 0 ? (
                  <Icon name={delta > 0 ? "trendUp" : "trendDown"} size={12} color={tone} sw={1.7} />
                ) : null}
                <Text style={[TYPOGRAPHY.metaSemiBold, { color: tone }]}>{formatDelta(delta, 2)}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[TYPOGRAPHY.tableHead, styles.scoreLabel, { color: C.text3 }]}>TOPLAM NET</Text>
          {prevNet != null ? (
            <Text style={[TYPOGRAPHY.micro, styles.prevText, { color: C.text3 }]}>
              {`önceki ${formatNumber(prevNet, 2)} \u2192 yeni ${formatNumber(net, 2)}`}
            </Text>
          ) : null}
        </View>

        {/* Gelisim / Rapor Cumlesi */}
        {sentence ? (
          <View style={[styles.insightBox, { backgroundColor: C.void, borderColor: C.elev }]}>
            <View style={[styles.insightIconWrap, { backgroundColor: C.elev }]}>
              <Icon name={delta > 0 ? "trendUp" : delta < 0 ? "trendDown" : "activity"} size={13} color={tone} sw={1.6} />
            </View>
            <Text style={[TYPOGRAPHY.caption, styles.insightText, { color: C.text }]}>{sentence}</Text>
          </View>
        ) : null}

        {/* Ders Ders Degisim */}
        {bars.length > 0 ? (
          <View style={styles.subjectsSection}>
            <View style={[styles.subjectsHeader, { borderBottomColor: C.line }]}>
              <Text style={[TYPOGRAPHY.tableHead, styles.colFlex, { color: C.text3 }]}>DERS DERS DEĞİŞİM</Text>
              <Text style={[TYPOGRAPHY.tableHead, styles.colNet, { color: C.text3 }]}>NET</Text>
              <Text style={[TYPOGRAPHY.tableHead, styles.colDelta, { color: C.text3 }]}>FARK</Text>
            </View>

            <View style={styles.subjectsList}>
              {bars.map((bar) => {
                const rowTone = bar.delta > 0 ? C.up : bar.delta < 0 ? C.down : C.text3;
                const fill = bar.max > 0 ? Math.max(0, Math.min(1, bar.net / bar.max)) : 0;
                return (
                  <View key={bar.key} style={styles.subjectRow}>
                    <View style={styles.rowTop}>
                      <View style={[styles.subjectDot, { backgroundColor: bar.color }]} />
                      <Text style={[TYPOGRAPHY.tableName, styles.subjectName, { color: C.text }]} numberOfLines={1}>
                        {bar.name}
                      </Text>
                      <Text style={[TYPOGRAPHY.tableValue, styles.subjectNet, { color: C.text }]}>
                        {formatNet(bar.net)}
                      </Text>
                      <Text style={[TYPOGRAPHY.metaSemiBold, styles.subjectDelta, { color: rowTone }]}>
                        {bar.delta != null ? formatDelta(bar.delta, 2) : "—"}
                      </Text>
                    </View>
                    <View style={[styles.track, { backgroundColor: C.track }]}>
                      <View style={[styles.fill, { width: `${fill * 100}%`, backgroundColor: bar.color }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Rapor Damgasi / Alt Bilgi */}
        <View style={[styles.footerRow, { borderTopColor: C.line }]}>
          <Text style={[TYPOGRAPHY.tableHead, styles.footerStamp, { color: C.text3 }]}>MARATON RAPOR PROTOKOLÜ</Text>
          <Text style={[TYPOGRAPHY.tableHead, styles.footerBadge, { color: C.accentBright }]}>RESMİ KAYIT</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, marginTop: STEP.s1 },
  card: {
    borderRadius: SHAPE.sheet,
    borderWidth: 1,
    padding: STEP.s3,
    position: "relative",
    overflow: "hidden",
  },
  cardSheen: { position: "absolute", top: 0, left: 0, right: 0, height: 110 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { flexDirection: "row", alignItems: "center", gap: STEP.s1, paddingHorizontal: STEP.s1, paddingVertical: STEP.s1 / 2, borderRadius: SHAPE.chip, borderWidth: 1 },
  dot: { width: 6, height: 6, borderRadius: SHAPE.chip / 2 },
  badgeText: { letterSpacing: 1.4 },
  scoreWrap: { alignItems: "center", marginTop: STEP.s2 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  heroNet: { lineHeight: 74 },
  deltaBadge: { flexDirection: "row", alignItems: "center", gap: STEP.s1 / 2, height: 26, paddingHorizontal: STEP.s1, borderRadius: SHAPE.button, borderWidth: 1 },
  scoreLabel: { marginTop: STEP.s1 / 4 },
  prevText: { marginTop: STEP.s1 / 4 },
  insightBox: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s2, padding: STEP.s2, borderRadius: SHAPE.button, borderWidth: 1 },
  insightIconWrap: { width: 22, height: 22, borderRadius: SHAPE.button, alignItems: "center", justifyContent: "center" },
  insightText: { flex: 1 },
  subjectsSection: { marginTop: STEP.s3 },
  subjectsHeader: { flexDirection: "row", alignItems: "baseline", paddingBottom: STEP.s1, borderBottomWidth: 1 },
  colFlex: { flex: 1 },
  colNet: { width: 52, textAlign: "right" },
  colDelta: { width: 52, textAlign: "right" },
  subjectsList: { marginTop: STEP.s1, gap: STEP.s1 },
  subjectRow: { paddingVertical: STEP.s1 / 4 },
  rowTop: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  subjectDot: { width: 6, height: 6, borderRadius: SHAPE.chip / 2 },
  subjectName: { flex: 1 },
  subjectNet: { width: 52, textAlign: "right" },
  subjectDelta: { width: 52, textAlign: "right" },
  track: { height: 4, borderRadius: SHAPE.chip / 2, marginTop: STEP.s1 / 2, marginLeft: STEP.s2, overflow: "hidden" },
  fill: { height: "100%", borderRadius: SHAPE.chip / 2 },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: STEP.s3, paddingTop: STEP.s2, borderTopWidth: 1 },
  footerStamp: { letterSpacing: 1.2 },
  footerBadge: { letterSpacing: 1.2 },
});
