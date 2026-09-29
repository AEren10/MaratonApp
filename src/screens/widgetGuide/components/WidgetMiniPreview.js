import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export const WidgetMiniPreview = React.memo(function WidgetMiniPreview({ widgetKey, C }) {
  return (
    <View style={[s.box, { backgroundColor: C.void, borderColor: C.line }]}>
      {widgetKey === "today" ? (
        <>
          <Text style={[TYPOGRAPHY.tableHead, s.tag, { color: C.accentBright }]}>BUGÜN</Text>
          <Text style={[TYPOGRAPHY.statMedium, s.heroNum, { color: C.text }]}>
            4<Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>/6</Text>
          </Text>
          <View style={s.bottomCol}>
            <View style={[s.track, { backgroundColor: C.track }]}>
              <View style={[s.fill, { width: "66%", backgroundColor: C.accent }]} />
            </View>
            <Text style={[TYPOGRAPHY.tableHead, s.metaText, { color: C.text3 }]}>2 durak kaldı</Text>
          </View>
        </>
      ) : widgetKey === "week" ? (
        <>
          <Text style={[TYPOGRAPHY.tableHead, s.tag, { color: C.accentBright }]}>HAFTA</Text>
          <View style={s.barsRow}>
            {[8, 14, 10, 18, 12, 16, 6].map((h, idx) => (
              <View
                key={idx}
                style={[
                  s.bar,
                  {
                    height: h,
                    backgroundColor: idx === 4 ? C.accent : C.track,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[TYPOGRAPHY.tableHead, s.metaText, { color: C.text2 }]}>18.5 sa</Text>
        </>
      ) : widgetKey === "route" ? (
        <>
          <Text style={[TYPOGRAPHY.tableHead, s.tag, { color: C.accentBright }]}>ROTA</Text>
          <Text style={[TYPOGRAPHY.statMedium, s.heroNum, { color: C.text }]}>259</Text>
          <Text style={[TYPOGRAPHY.tableHead, s.metaText, { color: C.text3 }]}>gün kaldı</Text>
        </>
      ) : widgetKey === "trial" ? (
        <>
          <Text style={[TYPOGRAPHY.tableHead, s.tag, { color: C.accentBright }]}>DENEME</Text>
          <Text style={[TYPOGRAPHY.statMedium, s.heroNum, { color: C.text }]}>74.5</Text>
          <Text style={[TYPOGRAPHY.tableHead, s.metaText, { color: C.up }]}>+3.2 net</Text>
        </>
      ) : widgetKey === "streak" ? (
        <>
          <Text style={[TYPOGRAPHY.tableHead, s.tag, { color: C.accentBright }]}>SERİ</Text>
          <Text style={[TYPOGRAPHY.statMedium, s.heroNum, { color: C.text }]}>
            24<Text style={[TYPOGRAPHY.micro, { color: C.accentBright }]}>g</Text>
          </Text>
          <View style={s.dotsRow}>
            {[1, 1, 1, 1, 1, 1, 1, 1].map((_, idx) => (
              <View
                key={idx}
                style={[
                  s.dot,
                  { backgroundColor: idx < 6 ? C.accent : C.track },
                ]}
              />
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={[TYPOGRAPHY.tableHead, s.tag, { color: C.accentBright }]}>TEKRAR</Text>
          <Text style={[TYPOGRAPHY.statMedium, s.heroNum, { color: C.text }]}>12</Text>
          <Text style={[TYPOGRAPHY.tableHead, s.metaText, { color: C.warn }]}>3 soru bugün</Text>
        </>
      )}
    </View>
  );
});

const s = StyleSheet.create({
  box: {
    width: 84,
    height: 84,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    padding: STEP.s1,
    justifyContent: "space-between",
  },
  tag: {
    letterSpacing: 0.8,
  },
  heroNum: {
    letterSpacing: -0.5,
    marginVertical: -2,
  },
  bottomCol: {
    gap: 3,
  },
  track: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 20,
    paddingHorizontal: 2,
  },
  bar: {
    width: 5,
    borderRadius: 1.5,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
    maxWidth: 68,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  metaText: {
    letterSpacing: 0,
    textTransform: "none",
  },
});
