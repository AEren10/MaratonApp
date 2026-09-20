import { View, Text, StyleSheet } from "react-native";
import { Avatar } from "../../../components/design/Avatar";
import { LiveDot } from "../../../components/design/LiveDot";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, SPACING } from "../../../themes/tokens";

export function GroupPodium({ topMembers = [] }) {
  const C = useC();
  if (!topMembers || topMembers.length < 2) return null;

  const first = topMembers[0];
  const second = topMembers[1];
  const third = topMembers[2];

  const renderPedestal = (member, rank, height, isCenter = false) => {
    if (!member) return <View style={{ flex: 1 }} />;
    const isYou = Boolean(member.is_user || member.you);
    const questions = Number(member.weekly_questions ?? member.questions ?? 0);

    return (
      <View style={[styles.pedestalCol, { flex: 1 }]}>
        <View style={styles.avatarWrapper}>
          <Avatar
            init={(member.display_name || member.name || "?").slice(0, 2).toUpperCase()}
            size={isCenter ? 44 : 36}
            color={isYou ? C.accent : undefined}
          />
          {member.is_studying_now ? (
            <View style={[styles.liveDotPos, { backgroundColor: C.surface }]}>
              <LiveDot size={8} color={C.up} />
            </View>
          ) : null}
        </View>

        <Text
          style={[
            styles.memberName,
            { color: isYou ? C.accentBright : C.text },
          ]}
          numberOfLines={1}
        >
          {isYou ? "Sen" : member.display_name || member.name}
        </Text>

        <Text style={[styles.questionCount, { color: C.text }]}>
          {questions.toLocaleString("tr-TR")} <Text style={[styles.unit, { color: C.text3 }]}>soru</Text>
        </Text>

        <View
          style={[
            styles.baseBlock,
            {
              height,
              backgroundColor: isCenter ? C.elev : C.surface,
              borderColor: isCenter ? C.accent : C.border,
            },
          ]}
        >
          {isCenter ? (
            <Icon name="trophy" size={16} color={C.accent} style={styles.trophyIcon} />
          ) : (
            <Text style={[styles.rankNumber, { color: C.text3 }]}>{rank}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: C.text3 }]}>HAFTALIK LİDER TABLOSU</Text>
      <View style={styles.podiumRow}>
        {renderPedestal(second, 2, 85)}
        {renderPedestal(first, 1, 108, true)}
        {renderPedestal(third, 3, 72)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: STEP.s3,
  },
  sectionTitle: {
    ...TYPOGRAPHY.label,
    marginBottom: STEP.s2,
  },
  podiumRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: STEP.s1,
  },
  pedestalCol: {
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: SHAPE.chip,
  },
  liveDotPos: {
    position: "absolute",
    bottom: -1,
    right: -1,
    padding: 2,
    borderRadius: SHAPE.chip,
  },
  memberName: {
    ...TYPOGRAPHY.micro,
    marginBottom: 2,
    maxWidth: 90,
  },
  questionCount: {
    ...TYPOGRAPHY.tableValue,
    marginBottom: SHAPE.chip,
  },
  unit: {
    ...TYPOGRAPHY.micro,
  },
  baseBlock: {
    width: "100%",
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  trophyIcon: {
    marginBottom: 2,
  },
  rankNumber: {
    ...TYPOGRAPHY.subheading,
  },
});
