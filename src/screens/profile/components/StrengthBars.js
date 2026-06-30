import { View, Text } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function StrengthBars({ strengths }) {
  const C = useC();
  const sorted = [...strengths].sort((a, b) => b.v - a.v);

  return (
    <View style={{ marginBottom: SPACING.xxl }}>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.xs,
      }}>
        <Text style={[TYPOGRAPHY.label, { color: C.sec, letterSpacing: 1.3 }]}>
          {"GÜÇ HARİTASI"}
        </Text>
        <Text style={{ ...TYPOGRAPHY.caption, color: C.muted }}>
          ders doğruluk %
        </Text>
      </View>
      <View style={{ gap: 14 }}>
        {sorted.map((s, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
            <Text style={{
              width: 52,
              fontFamily: "Inter_500Medium",
              fontSize: 13,
              color: C.sec,
            }} numberOfLines={1}>
              {s.name}
            </Text>
            <View style={{
              flex: 1,
              height: 7,
              borderRadius: 4,
              backgroundColor: C.surface2,
              overflow: "hidden",
            }}>
              <View style={{
                width: `${s.v}%`,
                height: "100%",
                borderRadius: 4,
                backgroundColor: s.c,
              }} />
            </View>
            <Text style={{
              width: 46,
              textAlign: "right",
              fontFamily: "SpaceGrotesk_600SemiBold",
              fontSize: 13,
              color: C.text,
            }}>
              %{s.v}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
