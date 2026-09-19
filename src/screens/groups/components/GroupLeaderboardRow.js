import { View, Text, StyleSheet } from "react-native";
import { Avatar } from "../../../components/design/Avatar";
import { LiveDot } from "../../../components/design/LiveDot";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, SPACING } from "../../../themes/tokens";

export function GroupLeaderboardRow({ member }) {
  const C = useC();
  const isYou = member.is_user;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: isYou ? C.elev : C.surface,
          borderColor: isYou ? C.accent : C.border,
        },
      ]}
    >
      <View style={styles.rankCol}>
        <Text style={[styles.rankText, { color: isYou ? C.accentBright : C.text3 }]}>
          {member.rank}
        </Text>
      </View>

      <View style={styles.avatarWrapper}>
        <Avatar
          init={(member.display_name || "?").slice(0, 2).toUpperCase()}
          size={32}
          color={isYou ? C.accent : undefined}
        />
        {member.is_studying_now ? (
          <View style={[styles.liveDotPos, { backgroundColor: C.surface }]}>
            <LiveDot size={8} color={C.up} />
          </View>
        ) : null}
      </View>

      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.nameText, { color: isYou ? C.accentBright : C.text }]}
            numberOfLines={1}
          >
            {isYou ? "Sen" : member.display_name}
          </Text>
          {member.role === "admin" ? (
            <View style={[styles.roleBadge, { backgroundColor: C.void }]}>
              <Text style={[styles.roleText, { color: C.text3 }]}>Kurucu</Text>
            </View>
          ) : null}
        </View>

        {member.is_studying_now ? (
          <Text style={[styles.studyingText, { color: C.up }]}>Şu an çalışıyor</Text>
        ) : null}
      </View>

      <View style={styles.statCol}>
        <Text style={[styles.statValue, { color: isYou ? C.accentBright : C.text }]}>
          {member.weekly_questions.toLocaleString("tr-TR")}
        </Text>
        <Text style={[styles.statUnit, { color: C.text3 }]}>soru</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: STEP.s2,
    paddingVertical: STEP.s1,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    marginBottom: SHAPE.chip,
  },
  rankCol: { width: 24, alignItems: "center", marginRight: SHAPE.chip },
  rankText: { ...TYPOGRAPHY.topicName },
  avatarWrapper: { position: "relative", marginRight: STEP.s1 },
  liveDotPos: { position: "absolute", bottom: -1, right: -1, padding: 2, borderRadius: SHAPE.chip },
  infoCol: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: SHAPE.chip },
  nameText: { ...TYPOGRAPHY.micro },
  roleBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: SHAPE.chip / 2 },
  roleText: { ...TYPOGRAPHY.micro },
  studyingText: { ...TYPOGRAPHY.micro, marginTop: SPACING.xs / 2 },
  statCol: { alignItems: "flex-end" },
  statValue: { ...TYPOGRAPHY.tableValue },
  statUnit: { ...TYPOGRAPHY.micro },
});
