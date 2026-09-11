import { useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView, Linking, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, ErrorState } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { SettingsGroup } from "./components/SettingsGroup";
import { SettingsRow } from "./components/SettingsRow";
import { ReminderHourPicker } from "./components/ReminderHourPicker";
import { useNotificationPrefs } from "../../hooks/useNotificationPrefs";
import * as H from "../../lib/haptics";

function NotificationsSettingsContent() {
  const C = useC();
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const { prefs, busy, permissionDenied, update, dismissDenied } = useNotificationPrefs();

  if (!prefs) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <ActivityIndicator style={{ flex: 1 }} color={C.accent} />
      </SafeAreaView>
    );
  }

  if (permissionDenied) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
            <Icon name="arrowL" size={18} color={C.text2} />
          </Pressable>
          <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Bildirimler</Text>
        </View>
        <ErrorState
          preset="notificationDenied"
          style={{ flex: 1, justifyContent: "center", paddingHorizontal: GUTTER }}
          onPrimary={() => Linking.openSettings()}
          onSecondary={() => {
            H.tap();
            dismissDenied();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Bildirimler</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <SettingsGroup title="BİLDİRİMLER">
            <SettingsRow
              first
              label="Günlük Hatırlatıcı"
              hint="Çalışmayı unutmamak için bir hatırlatma"
              toggle
              value={prefs.dailyReminderEnabled}
              onToggle={(v) => update({ dailyReminderEnabled: v })}
            />
            {prefs.dailyReminderEnabled ? (
              <ReminderHourPicker
                hour={prefs.dailyReminderHour}
                onSelect={(h) => update({ dailyReminderHour: h, dailyReminderMinute: 0 })}
              />
            ) : null}

            <SettingsRow
              label="Streak Uyarısı"
              hint="Streak'in tehlikedeyse gece bildirilir"
              toggle
              value={prefs.streakRiskEnabled}
              onToggle={(v) => update({ streakRiskEnabled: v })}
            />
            <SettingsRow
              label="Deneme Hatırlatıcı"
              hint="Haftada bir deneme girmen için"
              toggle
              value={prefs.trialReminderEnabled}
              onToggle={(v) => update({ trialReminderEnabled: v })}
            />
            <SettingsRow
              label="Görev Hatırlatıcı"
              hint="Çalışma listen yarım kalırsa bildirir"
              toggle
              value={prefs.taskReminderEnabled !== false}
              onToggle={(v) => update({ taskReminderEnabled: v })}
            />
            <SettingsRow
              label="Haftalık Rapor"
              hint="Pazar 20:00"
              toggle
              value={prefs.weeklySummaryEnabled !== false}
              onToggle={(v) => update({ weeklySummaryEnabled: v })}
            />
          </SettingsGroup>
        </Animated.View>

        {busy ? <ActivityIndicator color={C.accent} style={{ marginTop: STEP.s3 }} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function NotificationsSettingsScreen() {
  return (
    <ScreenErrorBoundary>
      <NotificationsSettingsContent />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
  },
  scroll: { paddingBottom: 60 },
});
