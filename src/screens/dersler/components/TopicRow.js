import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../../components/design";
import { C, TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { SCREENS } from "../../../constants/screens";
import { getMastery } from "../../../lib/mastery";

function AccBadge({ acc }) {
  const color = acc >= 75 ? C.green : acc >= 50 ? C.amber : C.red;
  return (
    <View
      style={{
        backgroundColor: color + "18",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        minWidth: 44,
        alignItems: "center",
      }}
    >
      <Text style={{ ...TYPOGRAPHY.captionMedium, color }}>%{acc}</Text>
    </View>
  );
}

function MiniBar({ pct, color }) {
  return (
    <View
      style={{
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: color + "20",
      }}
    >
      <View
        style={{
          width: `${Math.round(pct * 100)}%`,
          height: 4,
          borderRadius: 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export const TopicRow = React.memo(function TopicRow({ topic, color, subject }) {
  const navigation = useNavigation();
  const mastery = getMastery({ q: topic.q, acc: topic.acc });
  const dotColor = mastery.color;

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
              backgroundColor: dotColor,
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
          <Icon name="hash" size={11} color={C.muted} sw={1.5} />
          <Text style={{ ...TYPOGRAPHY.micro, color: C.muted, marginLeft: 3 }}>
            {topic.q} soru
          </Text>
          {topic.wrong ? (
            <Text style={{ ...TYPOGRAPHY.micro, color: C.red, marginLeft: 8 }}>
              {topic.wrong} yanlis
            </Text>
          ) : null}
        </View>
      </View>

      {/* Right side: accuracy + mini bar */}
      <View style={{ alignItems: "flex-end", gap: 4, marginLeft: SPACING.sm }}>
        <AccBadge acc={topic.acc} />
        <MiniBar pct={topic.pct} color={color} />
      </View>

      <Icon name="chevR" size={14} color={C.muted} style={{ marginLeft: 6 }} />
    </Pressable>
  );
});
