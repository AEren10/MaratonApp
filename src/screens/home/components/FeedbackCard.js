import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, AnimatedPressable } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const COLOR_MAP = {
  red: (C) => ({ bg: C.red + "22", border: C.red + "44", solid: C.red }),
  amber: (C) => ({ bg: C.amber + "22", border: C.amber + "44", solid: C.amber }),
  green: (C) => ({ bg: C.green + "22", border: C.green + "44", solid: C.green }),
  blue: (C) => ({ bg: C.blue + "22", border: C.blue + "44", solid: C.blue }),
  purple: (C) => ({ bg: C.purple + "22", border: C.purple + "44", solid: C.purple }),
  coral: (C) => ({ bg: C.accent + "22", border: C.accent + "44", solid: C.accent }),
};

export function FeedbackCard({ nudge, onAction, delay = 0 }) {
  const C = useC();
  const colors = (COLOR_MAP[nudge.color] || COLOR_MAP.amber)(C);

  return (
    <AnimatedPressable
      onPress={() => onAction?.(nudge)}
      entering={FadeInDown.delay(delay).duration(420).springify().damping(16)}
    >
      <View style={[s.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <View style={s.inner}>
          <View style={s.row}>
            <View style={[s.iconBox, { backgroundColor: colors.solid + "36" }]}>
              <Icon name={nudge.icon || "alert"} size={20} color={colors.solid} />
              <View style={[s.dot, { backgroundColor: colors.solid, borderColor: C.textOnFill + "10" }]} />
            </View>
            <View style={s.content}>
              <Text style={[s.message, { color: C.text }]} numberOfLines={2}>
                {nudge.message}
              </Text>
              {nudge.detail ? (
                <Text style={[s.detail, { color: C.sec }]} numberOfLines={2}>
                  {nudge.detail}
                </Text>
              ) : null}
            </View>
          </View>
          {nudge.actionLabel ? (
            <View style={s.footer}>
              <View style={[s.actionBtn, { backgroundColor: colors.solid }]}>
                <Text style={[s.actionText, { color: C.textOnFill }]}>{nudge.actionLabel}</Text>
                <Icon name="arrowR" size={14} color={C.textOnFill} sw={2.5} />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

export function FeedbackStack({ nudges = [], onAction, max = 3 }) {
  const visible = nudges.slice(0, max);
  if (!visible.length) return null;

  return (
    <View style={s.stack}>
      {visible.map((n, i) => (
        <FeedbackCard key={`${n.type}-${n.subject || i}`} nudge={n} onAction={onAction} delay={i * 80} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  stack: { gap: SPACING.sm + 2 },
  card: {
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    overflow: "hidden",
  },
  inner: { padding: SPACING.lg },
  row: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  content: { flex: 1, gap: 4 },
  message: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
  },
  detail: {
    ...TYPOGRAPHY.caption,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: SPACING.md,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  actionText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
});
