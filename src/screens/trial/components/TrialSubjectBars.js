import { View, Text } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

export function TrialSubjectBars({ subjects, allSubjects }) {
  const C = useC();
  const bestNet = Math.max(...subjects.map((s) => Math.abs(s.avgNet)), 1);

  return (
    <View style={{
      backgroundColor: C.surface, borderRadius: RADIUS.xl,
      padding: SPACING.lg, borderWidth: 1, borderColor: C.border,
    }}>
      <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.sec, marginBottom: SPACING.md }}>
        Ders Bazlı Ortalama Net
      </Text>
      {subjects.slice(0, 10).map((s) => {
        const meta = allSubjects.find((a) => a.key === s.key);
        const color = meta?.color || C.muted;
        const name = meta?.name || s.key;
        const pct = Math.max(0, s.avgNet / bestNet);
        return (
          <View key={s.key} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
            <Text style={{ ...TYPOGRAPHY.bodyMedium, fontSize: 12, color: C.text, width: 72 }} numberOfLines={1}>
              {name}
            </Text>
            <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: C.surface2, overflow: "hidden" }}>
              <View style={{ width: `${Math.min(100, pct * 100)}%`, height: 6, borderRadius: 3, backgroundColor: color }} />
            </View>
            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 12, color, width: 38, textAlign: "right" }}>
              {s.avgNet.toFixed(1)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
