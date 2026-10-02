import { StyleSheet, Text, View } from "react-native";

import { SubjectIcon } from "../../../components/common/SubjectIcon";
import { Icon } from "../../../components/design/Icon";
import { Press } from "../../../components/design/Press";
import { useSubjectIdentity } from "../../../contexts/ThemeContext";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { weekReasons } from "../../../domain/route/weekReasons";

function ReasonRow({ row, onPress, C, first }) {
  const sid = useSubjectIdentity(row.subject);
  return (
    <Press haptic="tap" onPress={() => onPress(row.key)} accessibilityRole="button"
      accessibilityLabel={`${row.subjectLabel}, ${row.topic}. ${row.reason}`}
      style={[s.row, { borderTopColor: C.line }, first && s.first]}>
      <SubjectIcon subject={row.subjectLabel} subjectKey={row.subject} color={sid?.solid} size={34} />
      <View style={s.body}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]} numberOfLines={1}>
          <Text style={{ color: sid?.solid || C.text2 }}>{row.subjectLabel}</Text>{` · ${row.topic}`}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]} numberOfLines={2}>{row.reason}</Text>
      </View>
      <Icon name="chevR" size={14} color={C.text3} />
    </Press>
  );
}

// Rota sayfasi: grafigin altindaki haftalik kutu yerine rotanin KARARLARI.
// Kullanici rotanin onu tanidigini burada gorur: hangi durak, neden bu hafta
// (motorun kendi gerekcesi). Haftanin tamami tek bir yazi baglantisinda.
export function RouteWhyThisWeek({ C, week, onOpenStop, onOpenWeek }) {
  const { rows, open } = weekReasons(week);
  if (!rows.length) return null;
  return (
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BU HAFTA NEDEN BU DURAKLAR</Text>
      <Text style={[TYPOGRAPHY.meta, s.sub, { color: C.text3 }]}>
        Rotan denemelerine, yanlışlarına ve tempona bakıp seçti.
      </Text>
      {rows.map((row, i) => <ReasonRow key={row.key} row={row} onPress={onOpenStop} C={C} first={i === 0} />)}
      <Press haptic="tap" onPress={onOpenWeek} accessibilityRole="button" style={s.more}>
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>{`Haftanın tamamı · ${open} durak kaldı ›`}</Text>
      </Press>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 },
  sub: { marginTop: 2, marginBottom: STEP.s2 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s2, borderTopWidth: 1, minHeight: CONTROL.tapMin },
  first: {},
  body: { flex: 1, minWidth: 0, gap: 2 },
  more: { minHeight: CONTROL.tapMin, justifyContent: "center" },
});
