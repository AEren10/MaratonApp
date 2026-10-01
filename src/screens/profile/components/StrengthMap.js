import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { SectionLabel } from "../../../components/design";
import SubjectProgressRow from "../../../components/common/SubjectProgressRow";
import { useC } from "../../../contexts/ThemeContext";
import { useCurriculumMap } from "../../../hooks/useCurriculumMap";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { SCREENS } from "../../../constants/screens";

// GUC HARITASI -- ogrencinin GERCEK ders listesi (Mufredat ile ayni kaynak),
// TYT ve AYT ayri. Eskiden son denemelerin bolum basliklarindan kuruluyordu:
// "Fen Bilimleri" tek satir, alan disi dersler (Dil'de Kimya) sizabiliyordu.
// Deger konu ilerlemesi: bitirilen / toplam konu.
const groupTitle = (group) => (group.items.some((d) => String(d.key).startsWith("ydt_")) ? "YDT" : group.label);

export function StrengthMap() {
  const C = useC();
  const nav = useNavigation();
  const { groups, loading } = useCurriculumMap();
  if (loading || !groups.length) return null;

  return (
    <View style={{ marginHorizontal: GUTTER, marginTop: STEP.s3 + STEP.s1 }}>
      <SectionLabel style={{ color: C.text2 }}>GÜÇ HARİTASI</SectionLabel>
      {groups.map((group) => (
        <View key={group.key} style={{ marginBottom: STEP.s2 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s1 }}>
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text }]}>{groupTitle(group)}</Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{`${group.done}/${group.total} konu`}</Text>
          </View>
          {group.items.map((d, i) => (
            <SubjectProgressRow
              key={d.key}
              name={d.name}
              subjectKey={d.key}
              color={subjectColorOf(C, d.key)}
              pct={d.pct}
              value={`${d.done}/${d.total}`}
              variant="row"
              showChevron
              onPress={() => nav.navigate(SCREENS.SUBJECT_DETAIL, { subjectKey: d.key, subjectName: d.name })}
              accessibilityLabel={`${groupTitle(group)} ${d.name}, ${d.done}/${d.total} konu`}
              last={i === group.items.length - 1}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
