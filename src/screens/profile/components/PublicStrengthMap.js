import { StyleSheet, Text, View } from "react-native";

import { SectionLabel } from "../../../components/design";
import SubjectProgressRow from "../../../components/common/SubjectProgressRow";
import { useC } from "../../../contexts/ThemeContext";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function PublicStrengthMap({ subjects }) {
  const C = useC();
  return (
    <View style={styles.wrap}>
      <SectionLabel style={{ color: C.text2 }}>GÜÇ HARİTASI</SectionLabel>
      {subjects.length ? subjects.map((subject, index) => (
        <SubjectProgressRow
          key={subject.key}
          name={subject.name}
          subjectKey={subject.key}
          color={subjectColorOf(C, subject.key)}
          pct={subject.pct}
          value={`${Math.round(subject.pct)}%`}
          variant="row"
          last={index === subjects.length - 1}
          accessibilityLabel={`${subject.name}, yüzde ${Math.round(subject.pct)} ilerleme`}
        />
      )) : (
        <Text style={[TYPOGRAPHY.body, styles.empty, { color: C.text3 }]}>Henüz konu ilerlemesi yok.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: GUTTER, marginTop: STEP.s4 },
  empty: { marginTop: STEP.s2 },
});
