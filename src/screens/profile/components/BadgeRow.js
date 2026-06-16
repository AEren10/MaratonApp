import { View, Text, ScrollView } from "react-native";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { HexBadge } from "../../../components/design";

export function BadgeRow({ badges }) {
  const C = useC();
  return (
    <View style={{ marginBottom: SPACING.xxl }}>
      <Text
        style={[
          TYPOGRAPHY.label,
          { color: C.sec, marginBottom: SPACING.md, paddingHorizontal: SPACING.xs },
        ]}
      >
        ROZETLER
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: SPACING.lg, paddingHorizontal: SPACING.xs }}
      >
        {badges.map((b, i) => (
          <HexBadge
            key={i}
            icon={b.icon}
            color={b.color}
            locked={b.locked ?? b.earned === false}
            label={b.name}
            size={60}
          />
        ))}
      </ScrollView>
    </View>
  );
}
