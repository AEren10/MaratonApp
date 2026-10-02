import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { useAuth } from "../../../contexts/AuthContext";
import { useC } from "../../../contexts/ThemeContext";
import { useRouteHabits } from "../../../hooks/useRouteHabits";
import { DISCOVER_TIPS, useDiscoverTips } from "../../../hooks/useDiscoverTips";
import { useScheduleTipVisible } from "../../../hooks/useScheduleTipVisible";
import { knownTopicsReminderDue } from "../../../domain/program/knownTopicsReminder";
import { openProgram, PROGRAM_VIEWS } from "../../../navigation/openProgram";
import { CONTROL, SPACING, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Ayda bir: okulda bitirilen konulari Mufredat'ta isaretle. Rutin ipucu
// gorunurken cikmaz (iki ipucu ust uste binmesin). HabitDiscoverCard ile
// ayni kutusuz satir dili.
export const KnownTopicsReminder = React.memo(function KnownTopicsReminder({ style }) {
  const C = useC();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { habits } = useRouteHabits();
  const { snooze, isClosed, closedAt, loaded } = useDiscoverTips();

  const habitTipVisible = habits.length === 0 && !isClosed(DISCOVER_TIPS.HABIT);
  const due = loaded && knownTopicsReminderDue({
    accountCreatedAt: user?.created_at,
    lastAt: closedAt(DISCOVER_TIPS.KNOWN_TOPICS),
  });
  const scheduleTip = useScheduleTipVisible();
  if (!due || habitTipVisible || scheduleTip) return null;

  const open = () => {
    snooze(DISCOVER_TIPS.KNOWN_TOPICS);
    openProgram(navigation, PROGRAM_VIEWS.CURRICULUM);
  };

  return (
    <View style={[s.row, { borderColor: C.line }, style]}>
      <Press haptic="tap" onPress={open} accessibilityRole="button" style={s.body}
        accessibilityLabel="Okulda bitirdiğin konuları işaretle · Müfredat">
        <Icon name="check" size={16} color={C.accentBright} />
        <View style={s.textCol}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]} numberOfLines={1}>
            Okulda bitirdiğin konuları işaretle
          </Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]} numberOfLines={1}>
            Rota işaretli konuları sana yeniden vermez
          </Text>
        </View>
        <Icon name="chevR" size={14} color={C.text3} />
      </Press>
      <Press haptic="none" onPress={() => snooze(DISCOVER_TIPS.KNOWN_TOPICS)} accessibilityRole="button"
        accessibilityLabel="Bu ay gösterme" style={s.closeBtn}>
        <Icon name="x" size={14} color={C.text3} />
      </Press>
    </View>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s1, paddingVertical: STEP.s2,
    borderTopWidth: 1, borderBottomWidth: 1, marginVertical: STEP.s2,
  },
  body: { flex: 1, flexDirection: "row", alignItems: "center", gap: STEP.s2, minHeight: CONTROL.tapMin },
  textCol: { flex: 1, gap: SPACING.xs / 2 },
  closeBtn: { width: CONTROL.tapMin, height: CONTROL.tapMin, marginRight: -STEP.s2, alignItems: "center", justifyContent: "center" },
});
