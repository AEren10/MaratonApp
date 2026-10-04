import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Avatar } from "../../../components/design/Avatar";
import { useC } from "../../../contexts/ThemeContext";
import { alpha } from "../../../themes/colorMix";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";

export function GroupAvatarStack({ initial, memberCount, members = [] }) {
  const C = useC();
  const visible = members.slice(0, 4);
  const fallback = visible.length ? visible : [{ name: initial }];
  const rest = Math.max(0, memberCount - fallback.length);

  return (
    <View style={s.row}>
      {fallback.map((member, index) => (
        <Avatar
          key={member.user_id || `${member.name}-${index}`}
          init={(member.name || initial || "?").slice(0, 2).toUpperCase()}
          image={member.avatar_url}
          size={24}
          ring={1}
          style={[s.avatar, index > 0 && s.overlap]}
        />
      ))}
      {rest > 0 ? (
        <View style={[s.more, { backgroundColor: alpha(C.accent, 13), borderColor: C.bg }]}>
          <Text style={[TYPOGRAPHY.micro, { color: C.accentText }]}>+{rest}</Text>
        </View>
      ) : null}
      <Text style={[TYPOGRAPHY.micro, s.text, { color: C.text3 }]}>{memberCount} üye</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  avatar: { borderWidth: 1 },
  overlap: { marginLeft: -7 },
  more: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -7,
  },
  text: { marginLeft: SPACING.sm },
});
