import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { getMastery } from "../../../lib/mastery";

function AccBadge({ acc, q, subjectColor, C }) {
  const isDormant = q === 0;
  const color = isDormant
    ? (subjectColor || C.dormant)
    : acc >= 75 ? C.green : acc >= 50 ? C.amber : (acc < 30 && q >= 10) ? C.red : C.amber;
  return (
    <View
      style={{
        backgroundColor: isDormant ? (subjectColor ? subjectColor + "14" : C.dormantBg) : color + "18",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        minWidth: 44,
        alignItems: "center",
      }}
    >
      <Text style={{ ...TYPOGRAPHY.captionMedium, color, opacity: isDormant ? 0.7 : 1 }}>
        {isDormant ? "—" : `%${acc}`}
      </Text>
    </View>
  );
}

function MiniBar({ pct, color }) {
  return (
    <View
      style={{
        width: 56,
        height: 5,
        borderRadius: 3,
        backgroundColor: color + "22",
      }}
    >
      <View
        style={{
          width: `${Math.max(Math.round(pct * 100), 4)}%`,
          height: 5,
          borderRadius: 3,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export const TopicRow = React.memo(function TopicRow({ topic, color, subject }) {
  const C = useC();
  const navigation = useNavigation();
  const mastery = getMastery({ q: topic.q, acc: topic.acc });
  const dotColor = C[mastery.colorKey];

  const handlePress = () => {
    const subjectInfo = { key: subject.key, name: subject.name, color: subject.color, icon: subject.icon };
    navigation.navigate(SCREENS.TOPIC_STUDY, { topic, subject: subjectInfo });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: C.border + "60",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {/* Status dot */}
      <View style={{ width: 8, marginRight: 10 }}>
        {dotColor ? (
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: dotColor || (color + "50"),
            }}
          />
        ) : null}
      </View>

      {/* Name + question count */}
      <View style={{ flex: 1 }}>
        <Text
          style={{ ...TYPOGRAPHY.bodyMedium, color: C.text }}
          numberOfLines={1}
        >
          {topic.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
          <Icon name="hash" size={11} color={color} sw={1.5} style={{ opacity: 0.6 }} />
          <Text style={{ ...TYPOGRAPHY.micro, color, opacity: 0.6, marginLeft: 3 }}>
            {topic.q} soru
          </Text>
          {topic.wrong ? (
            <Text style={{ ...TYPOGRAPHY.micro, color: C.red, marginLeft: 8 }}>
              {topic.wrong} yanlış
            </Text>
          ) : null}
        </View>
      </View>

      {/* Right side: accuracy + mini bar */}
      <View style={{ alignItems: "flex-end", gap: 4, marginLeft: SPACING.sm }}>
        <AccBadge acc={topic.acc} q={topic.q} subjectColor={color} C={C} />
        <MiniBar pct={topic.pct} color={color} />
      </View>

      <Icon name="chevR" size={14} color={C.muted} style={{ marginLeft: 6 }} />
    </Pressable>
  );
});
