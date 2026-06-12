import { View, Text, Pressable } from "react-native";
import { Icon, Trend } from "../../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

const TYPE_BADGE = {
  TYT: { label: "TYT", color: C.blue },
  AYT_SAY: { label: "AYT SAY", color: C.amber },
  AYT_EA: { label: "AYT EA", color: C.purple },
  AYT_SOZ: { label: "AYT SOZ", color: C.green },
  BRANCH: { label: "Branş", color: C.teal },
  AYT: { label: "AYT", color: C.amber },
};

function HistoryRow({ item, onPress }) {
  const badge = TYPE_BADGE[item.trialType] || null;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          {badge && (
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: badge.color + "25",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
                marginBottom: 4,
              }}
            >
              <Text style={{ ...TYPOGRAPHY.micro, color: badge.color, letterSpacing: 0.5 }}>
                {badge.label}
              </Text>
            </View>
          )}
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.sec }}>{item.date}</Text>
        </View>

        <Text
          style={{
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 18,
            color: C.text,
            marginRight: SPACING.md,
          }}
        >
          {item.net}
        </Text>

        <View style={{ marginRight: SPACING.md }}>
          <Trend v={item.trend} size={11} />
        </View>

        <Icon name="chevR" size={16} color={C.muted} />
      </View>
    </Pressable>
  );
}

export function HistoryList({ history, onPress }) {
  return (
    <View style={{ gap: SPACING.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
        <Icon name="clock" size={18} color={C.blue} />
        <Text style={{ ...TYPOGRAPHY.subheading, color: C.text }}>Gecmis Denemeler</Text>
      </View>

      <View
        style={{
          backgroundColor: C.surface,
          borderRadius: RADIUS.xxl,
          borderWidth: 1,
          borderColor: C.border,
          overflow: "hidden",
        }}
      >
        {history.map((h, i) => (
          <View key={h.id || h.date}>
            {i > 0 && (
              <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: SPACING.lg }} />
            )}
            <HistoryRow item={h} onPress={() => onPress?.(h)} />
          </View>
        ))}
      </View>
    </View>
  );
}
