import { View, Text } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { getTrialTypes } from "../trialTypes";

const TYPE_COLORS = {
  TYT: "blue", AYT_SAY: "amber", AYT_EA: "purple",
  AYT_SOZ: "green", LGS: "green", BRANCH: "teal",
};

export function TypeBreakdown({ types }) {
  const C = useC();
  const typeMeta = getTrialTypes(C);

  return (
    <View style={{
      backgroundColor: C.surface, borderRadius: RADIUS.xl,
      padding: SPACING.lg, borderWidth: 1, borderColor: C.border,
    }}>
      <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.sec, marginBottom: SPACING.md }}>
        Deneme Türleri
      </Text>
      {types.map((t) => {
        const meta = typeMeta[t.key];
        const color = meta?.color || C.muted;
        const label = meta?.label || t.key;
        return (
          <View key={t.key} style={{
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            paddingVertical: 8,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
              <Text style={{ ...TYPOGRAPHY.bodyMedium, fontSize: 13, color: C.text }}>{label}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: C.muted }}>
                {t.count} deneme
              </Text>
              <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 14, color }}>
                {t.avgNet.toFixed(1)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
