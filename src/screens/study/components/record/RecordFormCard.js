import { Children, Fragment } from "react";
import { View, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { SHAPE, STEP } from "../../../../themes/tokens";

// DERS / KONU / TARIH / SORU / SURE satirlari: yuzey kart, satir arasi 1px cizgi.
export function RecordFormCard({ children, style }) {
  const C = useC();
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.elev }, style]}>
      {rows.map((row, i) => (
        <Fragment key={row.key ?? i}>
          {i > 0 ? <View style={[styles.line, { backgroundColor: C.line }]} /> : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: STEP.s3, borderRadius: SHAPE.sheet, borderWidth: 1 },
  line: { height: 1, marginVertical: STEP.s1 },
});
