import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button, Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function RouteNextActionCard({ C, action, onStart, onOpenStop }) {
  if (!action) return null;
  const color = subjectColorOf(C, action.subjectKey);
  const effortText = action.effort || (action.minutes > 0 ? `~${action.minutes} dk` : null);

  return (
    <View style={s.wrap}>
      <Press
        onPress={onOpenStop}
        disabled={!onOpenStop}
        style={[s.card, { backgroundColor: C.surface, borderColor: C.line }]}
      >
        <View style={[s.accentBar, { backgroundColor: color }]} />
        <View style={s.content}>
          <View style={s.headerRow}>
            <View style={[s.badge, { backgroundColor: C.void, borderColor: C.elev }]}>
              <View style={[s.dot, { backgroundColor: color }]} />
              <Text style={[TYPOGRAPHY.tableHead, s.badgeText, { color: C.text2 }]}>
                {action.subjectLabel.toLocaleUpperCase("tr-TR")}
              </Text>
            </View>
            <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>SIRADAKİ DURAK</Text>
          </View>

          <Text style={[TYPOGRAPHY.topicName, s.topicTitle, { color: C.text }]} numberOfLines={2}>
            {action.topicName}
          </Text>

          {effortText ? (
            <View style={s.metaRow}>
              <Icon name="clock" size={13} color={C.text3} />
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{effortText}</Text>
            </View>
          ) : null}

          <View style={s.actionRow}>
            <Button
              variant="primary"
              size="md"
              fullWidth
              icon="play"
              onPress={onStart}
            >
              Çalışmaya başla
            </Button>
          </View>
        </View>
      </Press>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: GUTTER,
    marginTop: STEP.s3,
  },
  card: {
    borderRadius: SHAPE.panel,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  content: {
    padding: STEP.s3,
    paddingLeft: STEP.s3 + STEP.s1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1 / 2,
    paddingHorizontal: STEP.s1,
    paddingVertical: STEP.s1 / 4,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: SHAPE.chip / 2,
  },
  badgeText: {
    letterSpacing: 0.8,
  },
  topicTitle: {
    marginTop: STEP.s2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1 / 2,
    marginTop: STEP.s1 + STEP.s1 / 4,
  },
  actionRow: {
    marginTop: STEP.s3,
  },
});
