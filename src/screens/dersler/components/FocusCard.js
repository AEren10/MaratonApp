import React from "react";
import { View, Text, Pressable } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";

export const FocusCard = React.memo(function FocusCard({ subject, identity, textColor, mutedColor, surface2Color, onPress }) {
  const { solid, tint } = identity;
  const pct = subject.pct || 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 22,
        borderWidth: 1,
        borderColor: solid + "40",
        backgroundColor: tint,
        padding: SPACING.lg,
        opacity: pressed ? 0.9 : 1,
        gap: SPACING.md,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 15,
            backgroundColor: solid + "28",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={subject.icon || "bookOpen"} size={26} color={solid} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ ...TYPOGRAPHY.bodySemiBold, fontSize: 17, color: textColor }}>
            {subject.name || subject.label}
          </Text>
          <Text style={{ ...TYPOGRAPHY.caption, color: mutedColor, marginTop: 2 }}>
            {subject.done}/{subject.total} konu · en düşük tamamlama
          </Text>
        </View>

        <Text
          style={{
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 30,
            lineHeight: 34,
            color: solid,
            letterSpacing: -1,
          }}
        >
          {pct}%
        </Text>
      </View>

      <View
        style={{
          height: 7,
          borderRadius: 4,
          backgroundColor: surface2Color,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 7,
            borderRadius: 4,
            backgroundColor: solid,
            width: `${pct}%`,
          }}
        />
      </View>
    </Pressable>
  );
});
