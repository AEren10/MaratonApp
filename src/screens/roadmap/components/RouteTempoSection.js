import { StyleSheet, Text, View } from "react-native";

import { Button, Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function RouteTempoSection({ rows, locked, onOpen }) {
  const C = useC();
  return (
    <View>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>TEMPO DEĞİŞİRSE</Text>
      <Text style={[TYPOGRAPHY.meta, s.lead, { color: C.text3 }]}>
        Şu anki tempo referans alınır. Senaryolar bu tempoya göre hesaplanır.
      </Text>
      {rows.map((row) => (
        <View key={row.id} style={[s.row, { borderBottomColor: C.line }]}>
          <Text style={[TYPOGRAPHY.tableName, s.flex, { color: C.text3 }]}>{row.label}</Text>
          {locked ? (
            <>
              <Icon name="lock" size={12} color={C.text4} />
              <View style={[s.ghost, { backgroundColor: C.track }]} />
            </>
          ) : (
            <Text style={[TYPOGRAPHY.tableValue, { color: row.tone === "up" ? C.up : C.down }]}>
              {row.value}
            </Text>
          )}
        </View>
      ))}
      <Button size="lg" fullWidth onPress={onOpen} style={s.button}>
        Senaryoları aç
      </Button>
    </View>
  );
}

const s = StyleSheet.create({
  lead: { marginTop: STEP.s1, paddingBottom: STEP.s1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    minHeight: 50,
    borderBottomWidth: 1,
  },
  flex: { flex: 1 },
  ghost: { width: 52, height: 16, borderRadius: SHAPE.chip },
  button: { marginTop: STEP.s2 },
});
