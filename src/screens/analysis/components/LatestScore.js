import { View, Text } from "react-native";
import { BentoCard, Stat, Trend, Chip, Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function LatestScore({ net, trend, date, typeLabel }) {
  const C = useC();
  return (
    <BentoCard
      gradient={[C.accent + "18", C.surface, C.surface]}
      accent={C.accent}
      pad={SPACING.xl}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Chip color={C.accent}>{typeLabel || "SON DENEME"}</Chip>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon name="calendar" size={14} color={C.sec} />
          <Text style={{ ...TYPOGRAPHY.caption, color: C.sec }}>{date}</Text>
        </View>
      </View>

      <View style={{ alignItems: "center", marginTop: SPACING.xl, marginBottom: SPACING.md }}>
        <Stat size={56} color={C.accent}>{net}</Stat>
        <Text style={{ ...TYPOGRAPHY.caption, color: C.sec, marginTop: SPACING.xs }}>
          toplam net
        </Text>
      </View>

      <View style={{ alignItems: "center" }}>
        <Trend v={trend} size={14} />
      </View>
    </BentoCard>
  );
}
