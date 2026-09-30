import { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY, NAV_ICON } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

function greeting(hour = new Date().getHours()) {
  if (hour < 5) return "İYİ GECELER";
  if (hour < 12) return "GÜNAYDIN";
  if (hour < 18) return "İYİ GÜNLER";
  return "İYİ AKŞAMLAR";
}

function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] || "").slice(0, 2);
  return letters.toLocaleUpperCase("tr");
}

function heroDateTR() {
  const d = new Date();
  const rawDay = d.toLocaleDateString("tr-TR", { weekday: "long" });
  const day = d.getDate();
  const rawMonth = d.toLocaleDateString("tr-TR", { month: "long" });
  const capDay = rawDay.charAt(0).toUpperCase() + rawDay.slice(1);
  const capMonth = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);
  return `${capDay}, ${day} ${capMonth}`;
}

// Ana Sayfa ust bandi: bas harf kutusu, selam + ad, Structured tarzı hero tarih basligi ve aksiyonlar.
export function HomeTopBar({ name, streak = 0, onProfile, onCalendar, onSocial }) {
  const C = useC();
  const days = Math.max(0, Math.round(Number(streak) || 0));
  const dateHeading = useMemo(() => heroDateTR(), []);

  return (
    <Animated.View style={s.wrap}>
      <View style={s.row}>
        <Pressable onPress={() => { H.tap(); onProfile?.(); }} hitSlop={STEP.s1 / 4}
          accessibilityRole="button" accessibilityLabel="Profil"
          style={[s.avatar, { backgroundColor: C.elev, borderColor: C.border }]}>
          <Text style={[TYPOGRAPHY.button, s.initials, { color: C.accentBright }]}>{initialsOf(name)}</Text>
        </Pressable>
        <View style={s.flex}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{greeting()}</Text>
          <Text numberOfLines={1} style={[TYPOGRAPHY.topicName, s.name, { color: C.text }]}>{name}</Text>
        </View>
        <Pressable onPress={() => { H.tap(); onSocial?.(); }}
          accessibilityRole="button"
          accessibilityLabel="Sosyal ve Gruplar"
          style={({ pressed }) => [s.iconBtn, { backgroundColor: pressed ? C.elev : C.surface, borderColor: C.border }]}>
          <Icon name="users" size={NAV_ICON.action} color={C.text2} />
        </Pressable>
        <Pressable onPress={() => { H.tap(); onCalendar?.(); }}
          accessibilityRole="button"
          accessibilityLabel={days > 0 ? `${days} günlük seri, takvimi aç` : "Takvimi aç"}
          style={({ pressed }) => [s.chip, { backgroundColor: pressed ? C.elev : C.surface, borderColor: C.border }]}>
          <Icon name="calendar" size={14} color={C.accent} />
          {days > 0 ? (
            <Text style={[TYPOGRAPHY.metaSemiBold, s.chipText, { color: C.text }]}>{`${days} GÜN`}</Text>
          ) : null}
        </Pressable>
      </View>

      <View style={s.dateRow}>
        <Text style={[TYPOGRAPHY.heading, s.dateText, { color: C.text }]}>{dateHeading}</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingTop: STEP.s1 - 2 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 1 },
  dateRow: { marginTop: STEP.s3, marginBottom: STEP.s1 },
  dateText: { fontSize: 26, lineHeight: 32, letterSpacing: -0.6 },
  avatar: {
    width: CONTROL.tapMin - 2, height: CONTROL.tapMin - 2, borderRadius: SHAPE.iconBox, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  initials: { fontSize: TYPOGRAPHY.button.fontSize + 2, lineHeight: TYPOGRAPHY.button.lineHeight + 2 },
  flex: { flex: 1, minWidth: 0 },
  name: { fontSize: TYPOGRAPHY.topicName.fontSize + 1, marginTop: STEP.s1 / 4 },
  iconBtn: {
    width: CONTROL.tapMin, height: CONTROL.tapMin, borderRadius: SHAPE.button, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  chip: {
    flexDirection: "row", alignItems: "center", gap: STEP.s1, height: CONTROL.tapMin,
    paddingHorizontal: STEP.s2 + 3, borderRadius: SHAPE.button, borderWidth: 1,
  },
  chipText: { fontSize: TYPOGRAPHY.micro.fontSize, letterSpacing: 0.7 },
});
