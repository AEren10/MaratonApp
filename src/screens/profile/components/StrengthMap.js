import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SectionLabel, Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER } from "../../../themes/tokens";
import { SCREENS } from "../../../constants/screens";
import * as H from "../../../lib/haptics";

function StrengthRow({ name, color, pct, last }) {
  const C = useC();
  return (
    <View style={{ paddingVertical: STEP.s2 + 2, borderBottomWidth: last ? 0 : 1, borderBottomColor: C.line }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: STEP.s1 + 2 }}>
        <View style={{ width: 8, height: 8, borderRadius: 1, backgroundColor: color }} />
        <Text style={{ flex: 1, fontFamily: "Archivo_500", fontSize: 14.5, color: C.text }}>{name}</Text>
        <Text style={{ fontFamily: "Bricolage_400", fontSize: 17, color: C.text, fontVariant: ["tabular-nums"] }}>
          %{pct}
        </Text>
      </View>
      <View style={{ height: 5, borderRadius: 2, backgroundColor: C.track, marginTop: STEP.s1 + 2, overflow: "hidden" }}>
        <View style={{ width: `${pct}%`, height: "100%", borderRadius: 2, backgroundColor: color }} />
      </View>
    </View>
  );
}

// Ders renkleri yalniz ders baglaminda — burada durum degil, sadece hangi
// dersin barina baktigimizi gosteriyor.
export function StrengthMap({ strengths }) {
  const C = useC();
  const nav = useNavigation();
  const sorted = [...strengths].sort((a, b) => b.v - a.v);

  if (!sorted.length) {
    return (
      <View style={{ marginHorizontal: GUTTER, marginTop: STEP.s3 + STEP.s1 }}>
        <SectionLabel style={{ color: C.text2 }}>GÜÇ HARİTASI</SectionLabel>
        <Pressable
          accessibilityRole="button"
          onPress={() => { H.tap(); nav.navigate(SCREENS.TRIAL_ENTRY); }}
          style={({ pressed }) => ({
            backgroundColor: C.surface, borderRadius: 20,
            borderWidth: 1, borderColor: C.border,
            padding: STEP.s3, alignItems: "center",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Icon name="chart" size={22} color={C.text3} style={{ marginBottom: STEP.s1 }} />
          <Text style={{ fontFamily: "Archivo_500", fontSize: 13, color: C.text2, textAlign: "center" }}>
            Denemeni gir, güçlerin burada görünsün
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ marginHorizontal: GUTTER, marginTop: STEP.s3 + STEP.s1 }}>
      <SectionLabel style={{ color: C.text2 }}>GÜÇ HARİTASI</SectionLabel>
      {sorted.map((s, i) => (
        <StrengthRow key={s.name} name={s.name} color={s.c} pct={s.v} last={i === sorted.length - 1} />
      ))}
    </View>
  );
}
