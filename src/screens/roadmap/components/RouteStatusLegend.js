import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { ROUTE_STOP_STATUS as S, routeStopStatusLabel } from "../../../domain/route/stopStatus";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { RouteStatusGlyph } from "./RouteStatusGlyph";

const ROWS = [
  [S.COMPLETED, "Dolu düğüm, kesintisiz çizgi"],
  [S.ACTIVE, "Halka ve yumuşak dış halka, sonrası noktalı"],
  [S.UPCOMING, "İçi boş düğüm, noktalı çizgi"],
  [S.RESCHEDULED, "Kesikli halka, kesikli çizgi"],
  [S.SKIPPED, "Çapraz işaret, seyrek noktalı çizgi"],
  [S.LOCKED, "Kilit ikonu, sönük çizgi"],
  [S.FROZEN, "Donuk dolgu, gri kesintisiz çizgi"],
];

// "DURAK DURUMLARI" — yedi durumun sekil sozlugu. Kopya tasarimdan birebir.
export function RouteStatusLegend() {
  const C = useC();
  return (
    <View>
      <View style={s.head}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>DURAK DURUMLARI</Text>
        <View style={[s.rule, { backgroundColor: C.line }]} />
      </View>
      {ROWS.map(([status, desc]) => (
        <View key={status} style={[s.row, { borderTopColor: C.line }]}>
          <RouteStatusGlyph status={status} C={C} />
          <Text style={[TYPOGRAPHY.captionMedium, s.name, { color: C.text }]}>{routeStopStatusLabel(status)}</Text>
          <Text style={[TYPOGRAPHY.micro, s.desc, { color: C.text3 }]}>{desc}</Text>
        </View>
      ))}
      <Text style={[TYPOGRAPHY.micro, s.foot, { color: C.text3 }]}>
        Durumlar yalnızca renkle değil; düğüm şekli, çizgi stili ve ikonla da ayrılır.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s1, paddingBottom: STEP.s1 / 4 },
  rule: { flex: 1, height: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2,
    borderTopWidth: 1,
  },
  name: { width: 112 },
  desc: { flex: 1, minWidth: 0 },
  foot: { marginTop: STEP.s2 },
});
