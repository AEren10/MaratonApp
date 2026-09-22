import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
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

// Ana Sayfa ust bandi: bas harf kutusu, selam + ad, sinava kalan gun cipi.
export function HomeTopBar({ name, streak = 0, onProfile, onCalendar }) {
  const C = useC();
  // Bu cip eskiden sinava kalan gunu yaziyordu — ama ayni sayi hemen altinda
  // "YKS 2028 / 632 gun" olarak zaten duruyor. Ayni ekranda ayni sayi iki kez.
  // Tasarimda buradaki sayi SERI: her gun degisen, takvime goturen bir sey.
  const days = Math.max(0, Math.round(Number(streak) || 0));
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={s.row}>
      <Pressable onPress={() => { H.tap(); onProfile?.(); }} hitSlop={STEP.s1 / 4}
        accessibilityRole="button" accessibilityLabel="Profil"
        style={[s.avatar, { backgroundColor: C.elev, borderColor: C.border }]}>
        <Text style={[TYPOGRAPHY.button, s.initials, { color: C.accentBright }]}>{initialsOf(name)}</Text>
      </Pressable>
      <View style={s.flex}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{greeting()}</Text>
        <Text numberOfLines={1} style={[TYPOGRAPHY.topicName, s.name, { color: C.text }]}>{name}</Text>
      </View>
      <Pressable onPress={() => { H.tap(); onCalendar?.(); }}
        accessibilityRole="button"
        accessibilityLabel={days > 0 ? `${days} günlük seri, takvimi aç` : "Takvimi aç"}
        style={({ pressed }) => [s.chip, { backgroundColor: pressed ? C.elev : C.surface, borderColor: C.border }]}>
        <Icon name="calendar" size={14} color={C.accent} />
        {/* Seri 0 iken "0 GÜN" yazmak cesaret kirar; ikon tek basina kalir. */}
        {days > 0 ? (
          <Text style={[TYPOGRAPHY.metaSemiBold, s.chipText, { color: C.text }]}>{`${days} GÜN`}</Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 1, paddingTop: STEP.s1 - 2 },
  avatar: {
    width: CONTROL.tapMin - 2, height: CONTROL.tapMin - 2, borderRadius: SHAPE.iconBox, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  initials: { fontSize: TYPOGRAPHY.button.fontSize + 2, lineHeight: TYPOGRAPHY.button.lineHeight + 2 },
  flex: { flex: 1, minWidth: 0 },
  name: { fontSize: TYPOGRAPHY.topicName.fontSize + 1, marginTop: STEP.s1 / 4 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: STEP.s1, height: CONTROL.tapMin,
    paddingHorizontal: STEP.s2 + 3, borderRadius: SHAPE.button, borderWidth: 1,
  },
  chipText: { fontSize: TYPOGRAPHY.micro.fontSize, letterSpacing: 0.7 },
});
