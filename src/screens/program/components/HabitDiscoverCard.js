import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { SCREENS } from "../../../constants/screens";
import { useC } from "../../../contexts/ThemeContext";
import { useRouteHabits } from "../../../hooks/useRouteHabits";
import { DISCOVER_TIPS, useDiscoverTips } from "../../../hooks/useDiscoverTips";
import { SHAPE, STEP, TYPOGRAPHY, SPACING } from "../../../themes/tokens";

export const HabitDiscoverCard = React.memo(function HabitDiscoverCard({ style }) {
  const C = useC();
  const navigation = useNavigation();
  const { habits } = useRouteHabits();
  const { isClosed, close } = useDiscoverTips();

  if (habits.length > 0 || isClosed(DISCOVER_TIPS.HABIT)) return null;

  const handleOpen = () => {
    navigation.navigate(SCREENS.ROUTE_HABITS);
  };

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.line }, style]}>
      <Press
        haptic="tap"
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel="Her gün paragraf, problem çöz · Günlük rutin"
        style={s.body}
      >
        <View style={[s.iconBox, { backgroundColor: C.accent + "14", borderColor: C.accent + "28" }]}>
          <Icon name="flame" size={13} color={C.accentBright} />
        </View>
        <View style={s.textCol}>
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text }]} numberOfLines={1}>
            Her gün paragraf & problem çöz
          </Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]} numberOfLines={1}>
            Günlük rutin · her sabah otomatik eklenir
          </Text>
        </View>
        <Icon name="chevR" size={13} color={C.text3} />
      </Press>
      <Press
        haptic="none"
        onPress={() => close(DISCOVER_TIPS.HABIT)}
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
    gap: SPACING.xs / 2,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
});
