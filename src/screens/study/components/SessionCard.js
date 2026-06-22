import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useSubjectIdentity } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";

const formatDuration = (min) => {
  if (!min || min < 1) return "< 1 dk";
  if (min < 60) return `${min} dk`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
};

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const SessionCard = React.memo(function SessionCard({ item, C }) {
  const sub = getSubjectByKey(item.subject);
  const identity = useSubjectIdentity(item.subject);
  const color = identity?.solid || sub?.color || C.accent;
  const iconName = sub?.icon || "bookOpen";
  const label = sub?.label || sub?.name || item.subject || "Bilinmiyor";

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={[styles.iconBox, { backgroundColor: color + "1A" }]}>
        <Icon name={iconName} size={18} color={color} />
      </View>
      <View style={styles.cardBody}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>
          {item.topic || label}
        </Text>
        <View style={styles.meta}>
          <Text style={[TYPOGRAPHY.caption, { color: C.muted }]}>{label}</Text>
          {item.question_count > 0 && (
            <Text style={[TYPOGRAPHY.caption, { color: C.muted }]}>
              {" · "}{item.question_count} soru
              {item.correct_count > 0 ? ` (${item.correct_count}D)` : ""}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color }]}>
          {formatDuration(item.duration_minutes)}
        </Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>
          {formatTime(item.created_at)}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center",
    borderRadius: RADIUS.lg, borderWidth: 1,
    padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.md,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    alignItems: "center", justifyContent: "center",
  },
  cardBody: { flex: 1, gap: 2 },
  meta: { flexDirection: "row", alignItems: "center" },
  cardRight: { alignItems: "flex-end", gap: 2 },
});
