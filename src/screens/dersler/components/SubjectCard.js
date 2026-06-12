import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { IconBox, Icon } from "../../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { TopicRow } from "./TopicRow";
import { masteryPercent } from "../../../lib/mastery";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function ProgressBar({ pct, color }) {
  return (
    <View
      style={{
        height: 4,
        borderRadius: 2,
        backgroundColor: color + "20",
        marginTop: SPACING.md,
      }}
    >
      <View
        style={{
          width: `${pct}%`,
          height: 4,
          borderRadius: 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export const SubjectCard = React.memo(function SubjectCard({ subject }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    if (Platform.OS !== "web") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setOpen((v) => !v);
  }, []);

  const { name, icon, color, pct, done, total, last, topics } = subject;
  const masteryPct = masteryPercent(topics);

  return (
    <View>
    <View
      style={{
        backgroundColor: C.surface,
        borderRadius: RADIUS.xxl,
        borderWidth: 1,
        borderColor: open ? color + "40" : C.border,
        overflow: "hidden",
      }}
    >
      {/* Top accent line */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: color,
          opacity: 0.5,
        }}
      />

      <Pressable
        onPress={toggle}
        style={({ pressed }) => ({
          padding: SPACING.lg,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        {/* Header row */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <IconBox icon={icon} color={color} size={42} rounded={14} />
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text }}>
              {name}
            </Text>
            <Text style={{ ...TYPOGRAPHY.micro, color: C.sec, marginTop: 2 }}>
              {done}/{total} konu
            </Text>
          </View>
          <Text
            style={{
              ...TYPOGRAPHY.statSmall,
              color,
              marginRight: SPACING.sm,
            }}
          >
            %{pct}
          </Text>
          <Icon
            name={open ? "chevUp" : "chevDown"}
            size={18}
            color={C.sec}
          />
        </View>

        {/* Progress bar */}
        <ProgressBar pct={pct} color={color} />

        {/* Stats row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: SPACING.sm,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="clock" size={13} color={C.muted} sw={1.5} />
            <Text
              style={{
                ...TYPOGRAPHY.caption,
                color: C.sec,
                marginLeft: 4,
              }}
            >
              {last || "Henüz çalışılmadı"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: masteryPct > 0 ? C.green : C.muted,
              }}
            />
            <Text
              style={{
                ...TYPOGRAPHY.caption,
                color: C.sec,
                marginLeft: 4,
              }}
            >
              %{masteryPct} ustalaşıldı
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Expanded topics — outside the toggle Pressable */}
      {open && topics?.length > 0 ? (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: C.border,
            paddingBottom: SPACING.xs,
          }}
        >
          {topics.map((t) => (
            <TopicRow key={t.name} topic={t} color={color} subject={subject} />
          ))}
        </View>
      ) : null}
    </View>
    </View>
  );
});
