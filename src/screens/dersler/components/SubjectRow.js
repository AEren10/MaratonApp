import React from "react";
import { View, Text, Pressable } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";

export const SubjectRow = React.memo(function SubjectRow({ subject, identity, textColor, mutedColor, surface2Color, onPress, isLast }) {
  const { solid, tint } = identity;
  const pct = subject.pct || 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 13,
        gap: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: "rgba(255,255,255,0.06)",
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          backgroundColor: tint,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={subject.icon || "bookOpen"} size={20} color={solid} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{ ...TYPOGRAPHY.bodySemiBold, fontSize: 15, color: textColor }}
          numberOfLines={1}
        >
          {subject.name || subject.label}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 7, gap: 9 }}>
          <View
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              backgroundColor: surface2Color,
              overflow: "hidden",
            }}
          >
            <View style={{ height: 5, borderRadius: 3, backgroundColor: solid, width: `${pct}%` }} />
          </View>

          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 11,
              lineHeight: 14,
              color: mutedColor,
              minWidth: 28,
              textAlign: "right",
            }}
          >
            {subject.done}/{subject.total}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 16,
          lineHeight: 20,
          color: solid,
          minWidth: 42,
          textAlign: "right",
        }}
      >
        {pct}%
      </Text>
    </Pressable>
  );
});
