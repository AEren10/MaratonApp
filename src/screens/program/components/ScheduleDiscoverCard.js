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
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }, style]}>
      <Press
        haptic="tap"
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel="Haftalık programını kur · 2 dakika"
        style={s.body}
      >
        <View style={[s.iconBox, { backgroundColor: C.accent + "18", borderColor: C.accent + "30" }]}>
          <Icon name="calendar" size={16} color={C.accent} />
        </View>
        <View style={s.textCol}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>
            Haftalık programını kur · 2 dakika
          </Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>
            Derslerini günlere dağıt, rotan programına göre çizilsin.
          </Text>
        </View>
      </Press>
      <Press
        haptic="none"
        onPress={() => close(DISCOVER_TIPS.SCHEDULE)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="İpucunu kapat"
        style={s.closeBtn}
      >
        <Icon name="x" size={15} color={C.text3} />
      </Press>
    </View>
  );
});

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: STEP.s2,
    padding: STEP.s3,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    marginTop: STEP.s2,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: STEP.s2,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  closeBtn: {
    padding: 2,
  },
});
