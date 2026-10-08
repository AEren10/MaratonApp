import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Press } from "../../../components/design/Press";
import { GoalSlider } from "../../onboarding/components/GoalSlider";
import { GoalValueInput } from "./GoalValueInput";

// Tasarim: "Hedef Duzenle" — eksi/artı 52x52 kutular + ortada buyuk sayi,
// altinda min/su-an/max ile ilerleme cubugu.
//
// Ayni sablon hem hedef net hem gunluk soru hedefi icin kullaniliyor;
// `unit` ve `label` disaridan geliyor ki erisilebilirlik etiketi "hedef
// net" demeye devam etmesin.
export function GoalNetStepper({
  value, min, max, netLabel, unit, label = "hedef neti", currentNet, currentLabel,
  onChange, onDec, onInc, step = 1,
}) {
  const C = useC();
  const [trackWidth, setTrackWidth] = useState(0);
  const valueUnit = unit ?? `net · ${netLabel}`;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Press haptic="none"
          onPress={onDec}
          accessibilityRole="button"
          accessibilityLabel={`${label} azalt`}
          style={[styles.side, { borderColor: C.border }]}
        >
          <Icon name="minus" size={16} color={C.text2} />
        </Press>

        <View style={styles.center}>
          <GoalValueInput
            value={value} unit={valueUnit} label={label}
            min={min} max={max} step={step} onChange={onChange}
          />
        </View>

        <Press haptic="none"
          onPress={onInc}
          accessibilityRole="button"
          accessibilityLabel={`${label} artir`}
          style={[styles.side, { backgroundColor: C.brandFill }]}
        >
          <Icon name="plus" size={16} color={C.accentInk} />
        </Press>
      </View>

      <View style={styles.track} onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}>
        <GoalSlider
          value={value} onChange={onChange} C={C} trackWidth={trackWidth}
          min={min} max={max} step={step} accessibilityLabel={`${label} sürgüsü`}
          fillColor={C.text} trackColor={C.elev}
          thumbHalfSize={SHAPE.chip} thumbCornerRadius={SHAPE.chip}
        />
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
  rangeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s1 + 2 },
});
