import { View, Text, Pressable } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { HexBadge } from "../../../components/design";
import { useAlert } from "../../../contexts/AlertContext";
import * as H from "../../../lib/haptics";

export function BadgeRow({ allBadges, earnedIds }) {
  const C = useC();
  const showAlert = useAlert();
  const earnedCount = allBadges.filter((b) => earnedIds.includes(b.id)).length;

  const handlePress = (badge, earned) => {
    H.tap();
    if (earned) {
      showAlert(badge.name, badge.desc);
    } else {
      showAlert(`${badge.name}`, `${badge.desc}`);
    }
  };

  return (
    <View>
      <View style={{
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", marginBottom: SPACING.md,
      }}>
        <Text style={{ ...TYPOGRAPHY.label, color: C.sec }}>BAŞARIMLAR</Text>
        <Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>
          {earnedCount}/{allBadges.length}
        </Text>
      </View>

      {earnedCount === 0 && (
        <Text style={{
          ...TYPOGRAPHY.caption, color: C.muted,
          textAlign: "center", marginBottom: SPACING.md,
        }}>
          Rozet kazanmak için çalışma serine başla
        </Text>
      )}

      <View style={{
        flexDirection: "row", flexWrap: "wrap",
        gap: SPACING.lg, justifyContent: "center",
      }}>
        {allBadges.map((b) => {
          const earned = earnedIds.includes(b.id);
          return (
            <Pressable
              key={b.id}
              accessibilityRole="button"
              accessibilityLabel={`${b.name}${earned ? " - Kazanıldı" : " - Kilitli"}`}
              onPress={() => handlePress(b, earned)}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <HexBadge
                icon={b.icon}
                color={b.color}
                locked={!earned}
                label={b.name}
                size={60}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
