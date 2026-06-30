import { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { Icon, AnimatedPressable, Button } from "../../../components/design";

const storageKey = () => {
  const d = new Date().toISOString().slice(0, 10);
  return `@briefing_dismissed_${d}`;
};

function greet() {
  const h = new Date().getHours();
  if (h < 5) return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

export function MorningBriefing({ userName, planTaskCount, srDueCount, streak, onStart, onDismiss }) {
  const C = useC();
  const [visible, setVisible] = useState(false);
  const s = useMemo(() => makeStyles(C), [C]);

  useEffect(() => {
    AsyncStorage.getItem(storageKey()).then((v) => {
      if (!v) setVisible(true);
    });
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    AsyncStorage.setItem(storageKey(), "1");
    onDismiss?.();
  }, [onDismiss]);

  const handleStart = useCallback(() => {
    dismiss();
    onStart?.();
  }, [dismiss, onStart]);

  if (!visible) return null;

  const pills = [
    { icon: "book", label: `${planTaskCount} görev`, color: C.blue },
    { icon: "clock", label: `${srDueCount} tekrar`, color: C.amber },
    { icon: "flame", label: `${streak} gün streak`, color: C.coral },
  ];

  return (
    <Animated.View entering={FadeInDown.duration(420).springify().damping(20).mass(0.6)} style={s.card}>
      <Pressable onPress={dismiss} hitSlop={12} accessibilityLabel="Kapat" accessibilityRole="button" style={s.closeBtn}>
        <Icon name="x" size={18} color={C.muted} sw={2} />
      </Pressable>

      <Text style={s.greeting}>{greet()}, {userName}</Text>
      <Text style={s.sub}>Bugünkü planına göz at</Text>

      <View style={s.pillRow}>
        {pills.map((p) => (
          <View key={p.icon} style={[s.pill, { backgroundColor: p.color + "18" }]}>
            <Icon name={p.icon} size={14} color={p.color} sw={2} />
            <Text style={[s.pillText, { color: p.color }]}>{p.label}</Text>
          </View>
        ))}
      </View>

      <Button onPress={handleStart} icon="play" fullWidth size="sm">Başla</Button>
    </Animated.View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: C.accent + "30",
    padding: SPACING.xl,
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  closeBtn: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
  },
  greeting: { ...TYPOGRAPHY.subheading, color: C.text },
  sub: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: -SPACING.xs },
  pillRow: { flexDirection: "row", gap: SPACING.sm, flexWrap: "wrap" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.pill,
  },
  pillText: { ...TYPOGRAPHY.micro },
});
