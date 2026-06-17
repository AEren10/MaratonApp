import { View, Text } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { getSubjectByKey } from "../../../themes/subjects";
import { useC } from "../../../contexts/ThemeContext";

export function SubjectBreakdown({ subjects }) {
  const C = useC();
  if (!subjects || subjects.length === 0) return null;
  const maxQ = Math.max(...subjects.map((s) => s.questions), 1);

  return (
    <View style={{
      backgroundColor: C.surface, borderRadius: RADIUS.xl,
      padding: SPACING.lg, borderWidth: 1, borderColor: C.border,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: C.purple + "18", alignItems: "center", justifyContent: "center" }}>
          <Icon name="chart" size={14} color={C.purple} />
        </View>
        <Text style={{ ...TYPOGRAPHY.bodySemiBold, fontSize: 14, color: C.text }}>Ders Dağılımı</Text>
      </View>
      {subjects.slice(0, 6).map((s) => {
        const subj = getSubjectByKey(s.key);
        const color = subj?.color || C.muted;
        const pct = s.questions / maxQ;
        return (
          <View key={s.key} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Text style={{ ...TYPOGRAPHY.captionMedium, color, width: 72 }} numberOfLines={1}>
              {subj?.label || s.key}
            </Text>
            <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: C.surface2 }}>
              <View style={{ width: `${Math.round(pct * 100)}%`, height: 8, borderRadius: 4, backgroundColor: color }} />
            </View>
            <Text style={{ ...TYPOGRAPHY.micro, color: C.sec, width: 36, textAlign: "right" }}>
              {s.questions}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
