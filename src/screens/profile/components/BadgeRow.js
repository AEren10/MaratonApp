import { View, Text, ScrollView } from "react-native";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { IconBox } from "../../../components/design";

export function BadgeRow({ badges }) {
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
          <View
            key={i}
            style={{
              alignItems: "center",
              gap: SPACING.sm,
              width: 72,
            }}
          >
            <View
              style={{
                borderRadius: RADIUS.lg,
                borderWidth: 1,
                borderColor: b.color + "40",
                padding: 2,
              }}
            >
              <IconBox
                icon={b.icon}
                color={b.color}
                size={48}
                rounded={RADIUS.md}
              />
            </View>
            <Text
              style={[TYPOGRAPHY.micro, { color: C.sec, textAlign: "center" }]}
              numberOfLines={2}
            >
              {b.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
