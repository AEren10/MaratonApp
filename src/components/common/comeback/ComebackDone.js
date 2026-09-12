import { View, Text, StyleSheet } from "react-native";
import { CompletionShell } from "../completion/CompletionShell";
import { ComebackRouteArt } from "./ComebackRouteArt";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { formatNumber, formatMinutes } from "../../../lib/format";

// "bir durak kapandi" yalniz bugun gercekten COMPLETED olan rota duragi
// varsa yazilir; serbest calisma durak kapatmaz.
function buildLine(minutes, questions, stops) {
  const parts = [];
  if (minutes > 0) parts.push(formatMinutes(minutes));
  if (questions > 0) parts.push(`${formatNumber(questions)} soru`);
  if (stops === 1) parts.push("bir durak kapandı");
  else if (stops > 1) parts.push(`${formatNumber(stops)} durak kapandı`);
  return parts.join(" · ");
}

// "Geri Dondun" (AKIS 14) — donus duragi tamamlandiktan sonraki hal.
// Rota gostergesi net tahmini DEGIL; ilerleme cubugu yalnizca gercek
// rota orani (route.totals.progress: ustalasilan/toplam konu) varsa cizilir.
export function ComebackDone({
  minutesToday = 0,
  solvedToday = 0,
  stopsClosedToday = 0,
  routeProgress = null,
  onNext,
  onClose,
}) {
  const C = useC();
  const pct = routeProgress != null
    ? Math.max(0, Math.min(100, Math.round(routeProgress * 100)))
    : null;

  return (
    <CompletionShell
      visible
      onClose={onClose}
      eyebrow="DÖNÜŞ DURAĞI TAMAMLANDI"
      title="Geri döndün. Rota yeniden hareket ediyor."
      primaryLabel="Yarının durağını gör"
      onPrimary={onNext}
      secondaryLabel="Bugünlük bu kadar"
      onSecondary={onClose}
    >
      <ComebackRouteArt stage="done" />

      <View style={s.pad}>
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <View style={s.row}>
            <View style={[s.dot, { backgroundColor: C.up }]} />
            <Text style={[TYPOGRAPHY.caption, { flex: 1, color: C.text2 }]}>
              {buildLine(minutesToday, solvedToday, stopsClosedToday)}
            </Text>
          </View>
          {pct != null ? (
            <View style={[s.track, { backgroundColor: C.track }]}>
              <View style={[s.fill, { width: `${pct}%`, backgroundColor: C.up }]} />
            </View>
          ) : null}
          <Text style={[TYPOGRAPHY.micro, s.note, { color: C.text3 }]}>
            Bugünkü emeğin kayda geçti · uygulama içi rota göstergesi, net tahmini değildir
          </Text>
        </View>
      </View>
    </CompletionShell>
  );
}

const s = StyleSheet.create({
  pad: { paddingHorizontal: GUTTER },
  card: { paddingVertical: STEP.s3, paddingHorizontal: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  dot: { width: 7, height: 7 },
  track: { height: 4, marginTop: STEP.s2, borderRadius: SHAPE.chip, overflow: "hidden" },
  fill: { height: 4, borderRadius: SHAPE.chip },
  note: { marginTop: STEP.s1 },
});
