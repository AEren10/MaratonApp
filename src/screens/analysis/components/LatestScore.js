import { View, Text } from "react-native";
import { Card, StatBlock, Trend, Chip, Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function LatestScore({ net, trend, date, typeLabel }) {
  const C = useC();
  return (
    <Card tone="surface" radius="sheet" style={{ padding: STEP.s3 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Chip color={C.accent}>{typeLabel || "SON DENEME"}</Chip>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon name="calendar" size={14} color={C.text3} />
          <Text style={{ ...TYPOGRAPHY.caption, color: C.text3 }}>{date}</Text>
        </View>
      </View>

      <View style={{ alignItems: "center", marginTop: STEP.s3, marginBottom: STEP.s2 }}>
        <StatBlock value={net} size="large" color={C.text} align="center" />
        <Text style={{ ...TYPOGRAPHY.caption, color: C.text3, marginTop: 4 }}>
          toplam net
        </Text>
      </View>

      <View style={{ alignItems: "center" }}>
        <Trend v={trend} size={14} />
      </View>
    </Card>
  );
}
