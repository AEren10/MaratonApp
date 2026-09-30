import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { SCREENS } from "../../../constants/screens";
import { useC } from "../../../contexts/ThemeContext";
import { useRouteHabits } from "../../../hooks/useRouteHabits";
import { DISCOVER_TIPS, useDiscoverTips } from "../../../hooks/useDiscoverTips";
import { CONTROL, STEP, TYPOGRAPHY, SPACING } from "../../../themes/tokens";

export const HabitDiscoverCard = React.memo(function HabitDiscoverCard({ style }) {
  const C = useC();
  const navigation = useNavigation();
  const { habits } = useRouteHabits();
  const { isClosed, close } = useDiscoverTips();

  if (habits.length > 0 || isClosed(DISCOVER_TIPS.HABIT)) return null;

  const handleOpen = () => {
    navigation.navigate(SCREENS.ROUTE_HABITS);
  };

  // Kutusuz: ince iki cizgi arasinda bir baglanti satiri (Ders analizi deseni).
  return (
    <View style={[s.row, { borderColor: C.line }, style]}>
      <Press
        haptic="tap"
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel="Her gün paragraf, problem çöz · Günlük rutin"
        style={s.body}
      >
        <Icon name="flame" size={16} color={C.accentBright} />
        <View style={s.textCol}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]} numberOfLines={1}>
            Her gün paragraf & problem çöz
          </Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]} numberOfLines={1}>
            Günlük rutin · her sabah otomatik eklenir
          </Text>
        </View>
        <Icon name="chevR" size={14} color={C.text3} />
      </Press>
      <Press
        haptic="none"
        onPress={() => close(DISCOVER_TIPS.HABIT)}
        accessibilityRole="button"
        accessibilityLabel="İpucunu kapat"
        style={s.closeBtn}
      >
        <Icon name="x" size={14} color={C.text3} />
      </Press>
    </View>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
    paddingVertical: STEP.s2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginVertical: STEP.s2,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    minHeight: CONTROL.tapMin,
  },
  textCol: {
    flex: 1,
    gap: SPACING.xs / 2,
  },
  closeBtn: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    marginRight: -STEP.s2,
    alignItems: "center",
    justifyContent: "center",
  },
});
