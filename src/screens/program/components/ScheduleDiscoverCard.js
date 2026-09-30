import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { SCREENS } from "../../../constants/screens";
import { useC } from "../../../contexts/ThemeContext";
import { activeDayCount } from "../../../domain/program/classSchedule";
import { useClassSchedule } from "../../../hooks/useClassSchedule";
import { DISCOVER_TIPS, useDiscoverTips } from "../../../hooks/useDiscoverTips";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export const ScheduleDiscoverCard = React.memo(function ScheduleDiscoverCard({ style }) {
  const C = useC();
  const navigation = useNavigation();
  const { schedule, ready } = useClassSchedule();
  const { isClosed, close } = useDiscoverTips();

  if (!ready) return null;
  const count = activeDayCount(schedule);
  if (count > 1 || isClosed(DISCOVER_TIPS.SCHEDULE)) return null;

  const handleOpen = () => {
    navigation.navigate(SCREENS.CLASS_SCHEDULE);
  };

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.line }, style]}>
      <Press
        haptic="tap"
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel="Haftalık programını kur · 2 dakika"
        style={s.body}
      >
        <View style={[s.iconBox, { backgroundColor: C.accent + "14", borderColor: C.accent + "28" }]}>
          <Icon name="calendar" size={13} color={C.accentBright} />
        </View>
        <View style={s.textCol}>
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text }]} numberOfLines={1}>
            Haftalık programını kur · 2 dk
          </Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]} numberOfLines={1}>
            Derslerini günlere dağıt, rotan çizilsin
          </Text>
        </View>
        <Icon name="chevR" size={13} color={C.text3} />
      </Press>
      <Press
        haptic="none"
        onPress={() => close(DISCOVER_TIPS.SCHEDULE)}
        hitSlop={STEP.s2}
        accessibilityRole="button"
        accessibilityLabel="İpucunu kapat"
        style={s.closeBtn}
      >
        <Icon name="x" size={13} color={C.text3} />
      </Press>
    </View>
  );
});

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
    paddingVertical: STEP.s1,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    marginTop: STEP.s2,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    flex: 1,
    gap: 1,
  },
  closeBtn: {
    padding: STEP.s1 / 2,
  },
});
