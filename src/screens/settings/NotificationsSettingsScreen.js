import { useState, useCallback, useEffect, useMemo } from "react";
import { View, Text, Pressable, Switch, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon, IconBox } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import {
  getNotifPrefs,
  setNotifPrefs,
  applyNotifPrefs,
  requestNotificationPermissions,
} from "../../lib/notifications";
import { useAlert } from "../../contexts/AlertContext";

const HOUR_OPTIONS = [
  { h: 8, label: "08:00 Sabah" },
  { h: 13, label: "13:00 Öğlen" },
  { h: 19, label: "19:00 Akşam" },
  { h: 21, label: "21:00 Gece" },
];

export default function NotificationsSettingsScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const [prefs, setPrefs] = useState(null);
  const [busy, setBusy] = useState(false);
  const showAlert = useAlert();

  useEffect(() => {
    getNotifPrefs().then(setPrefs);
  }, []);

  const update = useCallback(
    async (patch) => {
      if (!prefs) return;
      const next = { ...prefs, ...patch };
      setPrefs(next);
      setBusy(true);
      try {
        if (next.dailyReminderEnabled || next.streakRiskEnabled) {
          const granted = await requestNotificationPermissions();
          if (!granted) {
            showAlert("İzin Gerekli", "Bildirim izni vermeden hatırlatıcı kuramayız.");
            next.dailyReminderEnabled = false;
            next.streakRiskEnabled = false;
            setPrefs(next);
          }
        }
        await setNotifPrefs(next);
        await applyNotifPrefs(next);
      } finally {
        setBusy(false);
      }
    },
    [prefs]
  );

  if (!prefs) {
    return (
      <SafeAreaView edges={["top"]} style={s.safe}>
        <ActivityIndicator style={{ flex: 1 }} color={C.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={s.headerTitle}>Bildirimler</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={s.list}>
        <View style={s.row}>
          <IconBox icon="clock" color={C.accent} size={38} rounded={12} />
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Günlük Hatırlatıcı</Text>
            <Text style={s.hint}>Çalışmayı unutmamak için bir hatırlatma</Text>
          </View>
          <Switch
            value={prefs.dailyReminderEnabled}
            onValueChange={(v) => update({ dailyReminderEnabled: v })}
            trackColor={{ false: C.border, true: C.accent + "80" }}
            thumbColor={prefs.dailyReminderEnabled ? C.accent : C.muted}
          />
        </View>

        {prefs.dailyReminderEnabled && (
          <View style={s.subBox}>
            <Text style={s.subLabel}>HATIRLATMA SAATİ</Text>
            <View style={s.chipRow}>
              {HOUR_OPTIONS.map((o) => {
                const active = prefs.dailyReminderHour === o.h;
                return (
                  <Pressable
                    key={o.h}
                    onPress={() => update({ dailyReminderHour: o.h, dailyReminderMinute: 0 })}
                    style={[
                      s.chip,
                      { borderColor: active ? C.accent : C.border, backgroundColor: active ? C.accent + "20" : "transparent" },
                    ]}
                  >
                    <Text style={[s.chipText, { color: active ? C.accent : C.sec }]}>
                      {o.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={s.row}>
          <IconBox icon="flame" color={C.red} size={38} rounded={12} />
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Streak Uyarısı</Text>
            <Text style={s.hint}>Streak'in tehlikedeyse gece bildirilir</Text>
          </View>
          <Switch
            value={prefs.streakRiskEnabled}
            onValueChange={(v) => update({ streakRiskEnabled: v })}
            trackColor={{ false: C.border, true: C.accent + "80" }}
            thumbColor={prefs.streakRiskEnabled ? C.accent : C.muted}
          />
        </View>

        <View style={s.row}>
          <IconBox icon="chart" color={C.blue} size={38} rounded={12} />
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Deneme Hatırlatıcı</Text>
            <Text style={s.hint}>Haftada bir deneme girmen için</Text>
          </View>
          <Switch
            value={prefs.trialReminderEnabled}
            onValueChange={(v) => update({ trialReminderEnabled: v })}
            trackColor={{ false: C.border, true: C.accent + "80" }}
            thumbColor={prefs.trialReminderEnabled ? C.accent : C.muted}
          />
        </View>

        <View style={s.row}>
          <IconBox icon="layers" color={C.accent} size={38} rounded={12} />
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Görev Hatırlatıcı</Text>
            <Text style={s.hint}>Çalışma listen yarım kalırsa bildirir</Text>
          </View>
          <Switch
            value={prefs.taskReminderEnabled !== false}
            onValueChange={(v) => update({ taskReminderEnabled: v })}
            trackColor={{ false: C.border, true: C.accent + "80" }}
            thumbColor={prefs.taskReminderEnabled !== false ? C.accent : C.muted}
          />
        </View>

        {busy && <ActivityIndicator color={C.accent} style={{ marginTop: SPACING.lg }} />}
      </View>
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    headerTitle: { ...TYPOGRAPHY.subheading, color: C.text },
    list: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
    row: {
      flexDirection: "row", alignItems: "center", gap: SPACING.md,
      backgroundColor: C.surface, borderRadius: RADIUS.xl,
      padding: SPACING.lg, marginBottom: SPACING.sm,
    },
    label: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
    hint: { ...TYPOGRAPHY.caption, color: C.muted, marginTop: 2 },
    subBox: {
      backgroundColor: C.surface + "80",
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
    },
    subLabel: {
      ...TYPOGRAPHY.label,
      color: C.muted,
      marginBottom: SPACING.sm,
    },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.xs },
    chip: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderWidth: 1,
      borderRadius: 999,
    },
    chipText: { ...TYPOGRAPHY.captionMedium },
  });
}
