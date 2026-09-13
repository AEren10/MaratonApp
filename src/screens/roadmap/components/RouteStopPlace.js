import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { useC } from "../../../contexts/ThemeContext";
import { ROUTE_STOP_STATUS as S, routeStopStatusLabel } from "../../../domain/route/stopStatus";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const pad2 = (n) => String(n).padStart(2, "0");

function NeighbourRow({ item, last, C }) {
  const done = item.status === S.COMPLETED;
  const open = item.status === S.UPCOMING || item.status === S.ACTIVE;
  const trailing = done ? "GEÇİLDİ" : open ? item.date : routeStopStatusLabel(item.status).toLocaleUpperCase("tr-TR");
  return (
    <View style={[s.row, { borderTopColor: C.line }, last && { borderBottomWidth: 1, borderBottomColor: C.line }]}>
      <Text style={[TYPOGRAPHY.topicName, s.num, { color: C.text3 }]}>{pad2(item.number)}</Text>
      <Text style={[TYPOGRAPHY.tableName, s.flex, { color: C.text3 }]} numberOfLines={1}>{item.topic}</Text>
      {trailing ? (
        <Text style={[done || !open ? TYPOGRAPHY.tableHead : TYPOGRAPHY.meta, { color: done ? C.up : C.text3 }]}>
          {trailing}
        </Text>
      ) : null}
    </View>
  );
}

// "ROTADAKİ YERİ": bu durak hattin ortasinda; oncesi cizili, sonrasi
// noktali. Altta bir onceki ve bir sonraki durak.
export function RouteStopPlace({ prev, next }) {
  const C = useC();
  return (
    <View style={s.pad}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>ROTADAKİ YERİ</Text>
      <View style={s.chart}>
        <Svg width="100%" height="100%" viewBox="0 0 346 74">
          <Path d="M 10 58 L 94 50 L 178 40" fill="none" stroke={C.accent} strokeWidth={3.4} strokeLinecap="round" />
          <Path d="M 178 40 L 262 28 L 336 16" fill="none" stroke={C.proj} strokeWidth={2.2} strokeLinecap="round" strokeDasharray="2 7" />
          <Circle cx={10} cy={58} r={4} fill={C.bg} stroke={C.accent} strokeWidth={2.2} />
          <Circle cx={94} cy={50} r={4} fill={C.bg} stroke={C.accent} strokeWidth={2.2} />
          <Circle cx={178} cy={40} r={7.5} fill={C.accent} />
          <Circle cx={262} cy={28} r={4} fill={C.bg} stroke={C.projNode} strokeWidth={2.2} />
          <Circle cx={336} cy={16} r={4} fill={C.bg} stroke={C.projNode} strokeWidth={2.2} />
        </Svg>
        <Text style={[TYPOGRAPHY.tableHead, s.here, { color: C.accentBright }]}>BU DURAK</Text>
      </View>
      <View style={s.rows}>
        {prev ? <NeighbourRow item={prev} last={!next} C={C} /> : null}
        {next ? <NeighbourRow item={next} last C={C} /> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  pad: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  chart: { width: "100%", aspectRatio: 346 / 74, marginTop: STEP.s2, position: "relative" },
  here: { position: "absolute", top: "66%", left: 0, right: 0, textAlign: "center" },
  rows: { marginTop: STEP.s2 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, minHeight: 52, borderTopWidth: 1 },
  num: { width: 26 },
  flex: { flex: 1 },
});
