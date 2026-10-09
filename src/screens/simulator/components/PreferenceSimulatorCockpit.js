import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Press } from "../../../components/design/Press";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const SCORE_TYPES = [
  { key: "say", label: "SAY" },
  { key: "ea", label: "EA" },
  { key: "soz", label: "SÖZ" },
  { key: "dil", label: "DİL" },
  { key: "tyt", label: "TYT" },
];

export const PreferenceSimulatorCockpit = memo(function PreferenceSimulatorCockpit({
  scoreType,
  onSelectScoreType,
  rankDetails,
  tytNet,
  onChangeTyt,
  aytNet,
  onChangeAyt,
  C,
}) {
  const adjustTyt = (delta) => onChangeTyt(Math.min(120, Math.max(0, Math.round((tytNet + delta) * 10) / 10)));
  const adjustAyt = (delta) => onChangeAyt(Math.min(80, Math.max(0, Math.round((aytNet + delta) * 10) / 10)));

  return (
    <View style={styles.wrap}>
      <View style={styles.typeRow}>
        {SCORE_TYPES.map((t) => {
          const act = scoreType === t.key;
          return (
            <Press
              key={t.key}
              haptic="tap"
              onPress={() => onSelectScoreType(t.key)}
              style={[
                styles.typeChip,
                { backgroundColor: act ? C.surface : C.void, borderColor: act ? C.accent : C.line },
              ]}
            >
              <Text style={[TYPOGRAPHY.captionMedium, { color: act ? C.accentBright : C.text3 }]}>
                {t.label}
              </Text>
            </Press>
          );
        })}
      </View>

      <View style={[styles.panel, { backgroundColor: C.surface, borderColor: C.line }]}>
        <View style={styles.resultRow}>
          <View style={styles.resultCol}>
            <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>TAHMİNİ SIRALAMA</Text>
            <Text style={[styles.rankText, { color: C.accentBright }]}>{rankDetails.rankBand}</Text>
          </View>
          <View style={[styles.vDivider, { backgroundColor: C.line }]} />
          <View style={styles.resultCol}>
            <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>TAHMİNİ PUAN</Text>
            <Text style={[styles.scoreText, { color: C.text }]}>{rankDetails.scoreFormatted}</Text>
          </View>
        </View>

        <View style={[styles.hDivider, { backgroundColor: C.line }]} />

        <View style={styles.stepperRow}>
          <View style={styles.stepperInfo}>
            <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>TYT NETİ</Text>
            <Text style={[styles.netVal, { color: C.text }]}>{tytNet}</Text>
          </View>
          <View style={styles.btnRow}>
            {[-5, -1, 1, 5].map((d) => (
              <Press
                key={d}
                haptic="tap"
                onPress={() => adjustTyt(d)}
                style={[styles.stepBtn, { backgroundColor: C.void, borderColor: C.line }]}
              >
                <Text style={[styles.stepBtnText, { color: d > 0 ? C.accentBright : C.text2 }]}>
                  {d > 0 ? `+${d}` : d}
                </Text>
              </Press>
            ))}
          </View>
        </View>

        {scoreType !== "tyt" ? (
          <View style={styles.stepperRow}>
            <View style={styles.stepperInfo}>
              <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{`${scoreType.toUpperCase()} NETİ`}</Text>
              <Text style={[styles.netVal, { color: C.text }]}>{aytNet}</Text>
            </View>
            <View style={styles.btnRow}>
              {[-5, -1, 1, 5].map((d) => (
                <Press
                  key={d}
                  haptic="tap"
                  onPress={() => adjustAyt(d)}
                  style={[styles.stepBtn, { backgroundColor: C.void, borderColor: C.line }]}
                >
                  <Text style={[styles.stepBtnText, { color: d > 0 ? C.accentBright : C.text2 }]}>
                    {d > 0 ? `+${d}` : d}
                  </Text>
                </Press>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: STEP.s2 },
  typeRow: { flexDirection: "row", gap: STEP.s1 },
  typeChip: { flex: 1, height: 34, borderRadius: SHAPE.chip, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  panel: { borderRadius: SHAPE.panel, borderWidth: 1, padding: STEP.s2, gap: STEP.s2 },
  resultRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  resultCol: { flex: 1, gap: 2 },
  vDivider: { width: 1, height: 36, marginHorizontal: STEP.s2 },
  hDivider: { height: 1 },
  rankText: { fontFamily: "Bricolage_400", fontSize: 22, fontVariant: ["tabular-nums"] },
  scoreText: { fontFamily: "Bricolage_400", fontSize: 20, fontVariant: ["tabular-nums"] },
  stepperRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepperInfo: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  netVal: { fontFamily: "Archivo_600", fontSize: 16, fontVariant: ["tabular-nums"] },
  btnRow: { flexDirection: "row", gap: 6 },
  stepBtn: { width: 44, height: 32, borderRadius: SHAPE.chip, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  stepBtnText: { fontFamily: "Archivo_600", fontSize: 13 },
});
