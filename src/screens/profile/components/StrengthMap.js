import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SectionLabel, Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER } from "../../../themes/tokens";
import { SCREENS } from "../../../constants/screens";
import { getSubjectBadge } from "../../../themes/subjects";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";

function StrengthRow({ name, subjectKey, color, pct, last }) {
  const C = useC();
  const badge = getSubjectBadge(subjectKey || name);
  return (
    <View style={{ paddingVertical: STEP.s2 + 2, borderBottomWidth: last ? 0 : 1, borderBottomColor: C.line }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s2 }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            backgroundColor: `${color}18`,
            borderWidth: 1,
            borderColor: `${color}35`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontFamily: "Archivo_700", fontSize: 11, color, letterSpacing: 0.5 }}>
            {badge}
          </Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: "Archivo_500", fontSize: 14.5, color: C.text }} numberOfLines={1}>
              {name}
            </Text>
            <Text style={{ fontFamily: "Bricolage_400", fontSize: 17, color: C.text, fontVariant: ["tabular-nums"] }}>
              %{pct}
            </Text>
          </View>
          <View style={{ height: 5, borderRadius: 2.5, backgroundColor: C.track, marginTop: STEP.s1, overflow: "hidden" }}>
            <View style={{ width: `${pct}%`, height: "100%", borderRadius: 2.5, backgroundColor: color }} />
          </View>
        </View>
      </View>
    </View>
  );
}

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
        <StrengthRow
          key={s.name + (s.key || "")}
          name={s.name}
          subjectKey={s.key}
          color={s.c}
          pct={s.v}
          last={i === sorted.length - 1}
        />
      ))}
    </View>
  );
}
