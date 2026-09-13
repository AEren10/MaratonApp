import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

// BASLANGIC · SINAV GUNU · FARK. Baslangic yalniz seviye testinden gelir;
// yoksa o iki kart dusurulur, SINAV GUNU tek basina kalir. Bant disinda
// SINAV GUNU karti vurgusunu kaybeder (tasarim "Tahmin Şaştı").
export function ForecastStatTrio({ view }) {
  const C = useC();

  const card = (label, value, opts = {}) => (
    <View
      key={label}
      style={[s.card, opts.tint
        ? { backgroundColor: C.brandTint, borderColor: C.border }
        : { backgroundColor: C.surface, borderColor: C.elev }]}
    >
      <Text style={[TYPOGRAPHY.label, { color: opts.tint ? C.accentBright : C.text3 }]} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[TYPOGRAPHY.statSmall, s.value, { color: opts.color || C.text }]}
        allowFontScaling={false}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );

  return (
    <View style={s.row}>
      {view.startText ? card("BAŞLANGIÇ", view.startText) : null}
      {card("SINAV GÜNÜ", view.actualText, { tint: view.emphasized })}
      {view.deltaText ? card("FARK", view.deltaText, { color: view.improved ? C.up : C.down }) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: STEP.s1 + 2 },
  card: { flex: 1, minWidth: 0, padding: 18, borderRadius: SHAPE.panel, borderWidth: 1 },
  value: { marginTop: STEP.s1 + 2 },
});
