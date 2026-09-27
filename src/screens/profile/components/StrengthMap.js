import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SectionLabel, Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER } from "../../../themes/tokens";
import { SCREENS } from "../../../constants/screens";
import { getSubjectBadge } from "../../../themes/subjects";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";
import SubjectProgressRow from "../../../components/common/SubjectProgressRow";

// Ders renkleri yalniz ders baglaminda — burada durum degil, sadece hangi
// dersin barina baktigimizi gosteriyor.
export function StrengthMap({ strengths = [] }) {
  const C = useC();
  const nav = useNavigation();
  const sorted = [...strengths].sort((a, b) => b.v - a.v);

  if (!sorted.length) {
    return (
      <View style={{ marginHorizontal: GUTTER, marginTop: STEP.s3 + STEP.s1 }}>
        <SectionLabel style={{ color: C.text2 }}>GÜÇ HARİTASI</SectionLabel>
        <Press haptic="none"
          accessibilityRole="button"
          onPress={() => { H.tap(); nav.navigate(SCREENS.TRIAL_ENTRY); }}
          style={{
            backgroundColor: C.surface, borderRadius: 20,
            borderWidth: 1, borderColor: C.border,
            padding: STEP.s3, alignItems: "center"
          }}
        >
          <Icon name="chart" size={22} color={C.text3} style={{ marginBottom: STEP.s1 }} />
          <Text style={{ fontFamily: "Archivo_500", fontSize: 13, color: C.text2, textAlign: "center" }}>
            Denemeni gir, güçlerin burada görünsün
          </Text>
        </Press>
      </View>
    );
  }

  return (
    <View style={{ marginHorizontal: GUTTER, marginTop: STEP.s3 + STEP.s1 }}>
      <SectionLabel style={{ color: C.text2 }}>GÜÇ HARİTASI</SectionLabel>
      {sorted.map((s, i) => (
        <SubjectProgressRow
          key={s.name + (s.key || "")}
          name={s.name}
          badge={getSubjectBadge(s.key || s.name)}
          color={s.c}
          pct={s.v}
          value={`%${s.v}`}
          variant="row"
          last={i === sorted.length - 1}
        />
      ))}
    </View>
  );
}
