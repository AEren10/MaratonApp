import React, { useMemo, useCallback } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Icon, Chip } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export const PlanTaskItem = React.memo(function PlanTaskItem({ task, onToggle, onStart, onInfo }) {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const REASON_COLORS = { gray: C.muted, red: C.red, amber: C.amber, blue: C.blue, green: C.green };
  const { s, topic, q, reason, rkind, done, id } = task;
  const reasonColor = REASON_COLORS[rkind] || C.muted;
  const handleToggle = useCallback(() => onToggle(id), [onToggle, id]);
  const handleStart = useCallback(() => onStart(id), [onStart, id]);
  const handleInfo = useCallback(() => (onInfo || onToggle)(id), [onInfo, onToggle, id]);

  return (
    <View style={[styles.card, { borderLeftColor: s.color }]}>
      <Pressable
        accessibilityLabel={done ? "Görevi tamamlandı olarak işaretle" : "Görevi tamamla"}
        accessibilityRole="button"
        onPress={handleToggle}
        style={styles.checkArea}
      >
        <Icon
          name={done ? "checkCircle" : "circle"}
          size={24}
          color={done ? s.color : C.border}
        />
      </Pressable>

      <Pressable
        accessibilityLabel={`${topic}, ${q} soru`}
        accessibilityRole="button"
        onPress={done ? handleInfo : handleStart}
        style={styles.middle}
      >
        <Text style={[TYPOGRAPHY.micro, { color: s.color, textTransform: "uppercase", letterSpacing: 0.8 }]}>
          {s.label || s.name}
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
        <Pressable
          accessibilityLabel="Görev nedenini göster"
          accessibilityRole="button"
          onPress={handleInfo}
          style={styles.reasonAction}
        >
          <Chip color={reasonColor} style={styles.reasonChip}>
            {reason}
          </Chip>
        </Pressable>
        {!done && (
          <Pressable
            accessibilityLabel="Çalışmayı başlat"
            accessibilityRole="button"
            onPress={handleStart}
            style={styles.playBtn}
          >
            <Icon name="play" size={14} color={s.color} />
          </Pressable>
        )}
      </View>
    </View>
  );
});

const makeStyles = (C) => StyleSheet.create({
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
    width: 48,
    height: 48,
  },
  middle: { flex: 1 },
  right: {
    alignItems: "flex-end",
    gap: SPACING.sm,
  },
  reasonAction: {
    minHeight: 44,
    justifyContent: "center",
  },
  reasonChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.pill,
    backgroundColor: C.surface2,
    justifyContent: "center",
    alignItems: "center",
  },
  strikethrough: {
    textDecorationLine: "line-through",
    textDecorationColor: C.muted,
  },
});
