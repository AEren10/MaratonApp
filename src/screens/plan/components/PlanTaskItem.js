import { Pressable, View, Text, StyleSheet } from "react-native";
import { Icon, Chip } from "../../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

const REASON_COLORS = {
  gray: C.muted,
  red: C.red,
  amber: C.amber,
};

export function PlanTaskItem({ task, onToggle, onStart }) {
  const { s, topic, q, reason, rkind, done } = task;
  const reasonColor = REASON_COLORS[rkind] || C.muted;

  return (
    <View style={[styles.card, { borderLeftColor: s.color }]}>
      <Pressable onPress={onToggle} hitSlop={8} style={styles.checkArea}>
        <Icon
          name={done ? "checkCircle" : "circle"}
          size={24}
          color={done ? s.color : C.border}
        />
      </Pressable>

      <Pressable onPress={onToggle} style={styles.middle}>
        <Text style={[TYPOGRAPHY.micro, { color: s.color, textTransform: "uppercase", letterSpacing: 0.8 }]}>
          {s.name}
        </Text>
        <Text
          style={[TYPOGRAPHY.bodySemiBold, { color: done ? C.muted : C.text, marginTop: 2 }, done && styles.strikethrough]}
          numberOfLines={1}
        >
          {topic}
        </Text>
        <Text style={{ ...TYPOGRAPHY.caption, color: C.muted, marginTop: 2 }}>
          {q} soru
        </Text>
      </Pressable>

      <View style={styles.right}>
        <Chip color={reasonColor} style={styles.reasonChip}>
          {reason}
        </Chip>
        {!done && (
          <Pressable onPress={onStart} hitSlop={6} style={styles.playBtn}>
            <Icon name="play" size={14} color={s.color} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: RADIUS.xl,
    borderLeftWidth: 3,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  checkArea: {
    justifyContent: "center",
    alignItems: "center",
    width: 32,
  },
  middle: { flex: 1 },
  right: {
    alignItems: "flex-end",
    gap: SPACING.sm,
  },
  reasonChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.surface2,
    justifyContent: "center",
    alignItems: "center",
  },
  strikethrough: {
    textDecorationLine: "line-through",
    textDecorationColor: C.muted,
  },
});
