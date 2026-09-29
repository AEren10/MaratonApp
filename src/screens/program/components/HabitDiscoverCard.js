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
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }, style]}>
      <Press
        haptic="tap"
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel="Her gün paragraf, problem çöz · Günlük rutin"
        style={s.body}
      >
        <View style={[s.iconBox, { backgroundColor: C.accent + "18", borderColor: C.accent + "30" }]}>
          <Icon name="flame" size={16} color={C.accent} />
        </View>
        <View style={s.textCol}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>
            Her gün paragraf, problem çöz · Günlük rutin
          </Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>
            Her günün başına otomatik eklenir, rutinin aksamaz.
          </Text>
        </View>
      </Press>
      <Press
        haptic="none"
        onPress={() => close(DISCOVER_TIPS.HABIT)}
        hitSlop={STEP.s2}
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
    marginTop: SPACING.xs / 2,
  },
  textCol: {
    flex: 1,
    gap: SPACING.xs / 2,
  },
  closeBtn: {
    padding: SPACING.xs / 2,
  },
});
