import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon, StatBlock } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Tasarim: "Hedef Duzenle" — eksi/artı 52x52 kutular + ortada buyuk sayi,
// altinda min/su-an/max ile ilerleme cubugu.
//
// Ayni sablon hem hedef net hem gunluk soru hedefi icin kullaniliyor;
// `unit` ve `label` disaridan geliyor ki erisilebilirlik etiketi "hedef
// net" demeye devam etmesin.
export function GoalNetStepper({
  value, min, max, netLabel, unit, label = "hedef neti", currentNet, currentLabel, onDec, onInc,
}) {
  const C = useC();
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          onPress={onDec}
          accessibilityRole="button"
          accessibilityLabel={`${label} azalt`}
          style={[styles.side, { borderColor: C.border }]}
        >
          <Icon name="minus" size={16} color={C.text2} />
        </Pressable>

        <View style={styles.center}>
          <StatBlock value={value} unit={unit ?? `net · ${netLabel}`} size="page" align="center" />
        </View>

        <Pressable
          onPress={onInc}
          accessibilityRole="button"
          accessibilityLabel={`${label} artir`}
          style={[styles.side, { backgroundColor: C.brandFill }]}
        >
          <Icon name="plus" size={16} color={C.accentInk} />
        </Pressable>
      </View>

      <View style={styles.track}>
        <View style={[styles.trackBg, { backgroundColor: C.track }]}>
          <View style={[styles.trackFill, { width: `${pct * 100}%`, backgroundColor: C.accent }]} />
        </View>
        <View style={styles.rangeRow}>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{min}</Text>
          {currentNet != null ? (
            <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>
              {currentLabel ?? `şu an ${currentNet}`}
            </Text>
          ) : null}
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{max}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s4 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + STEP.s1 },
  side: {
    width: 52, height: 52, borderRadius: SHAPE.iconBox,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center" },
  track: { marginTop: STEP.s3 },
  trackBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  trackFill: { height: 6, borderRadius: 3 },
  rangeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s1 + 2 },
});
