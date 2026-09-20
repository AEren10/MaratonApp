import { View, Text, Pressable, StyleSheet } from "react-native";
import { Avatar } from "../../../components/design/Avatar";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, SPACING } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export function GroupMembersList({ members = [], isAdmin, onRemoveMember }) {
  const C = useC();

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: C.text3 }]}>ÜYELER</Text>
        <Text style={[styles.countText, { color: C.text3 }]}>{members.length} üye</Text>
      </View>

      <View style={styles.list}>
        {members.map((member) => {
          const isYou = Boolean(member.is_user || member.you);
          const isMemberAdmin = member.role === "admin";
          const canRemove = isAdmin && !isYou && !isMemberAdmin;
          const memberName = member.display_name || member.name || "Öğrenci";

          return (
            <View
              key={member.user_id || member.id}
              style={[styles.memberRow, { borderBottomColor: C.line }]}
            >
              <Avatar
                init={memberName.slice(0, 2).toUpperCase()}
                size={32}
                color={isYou ? C.accent : undefined}
              />

              <View style={styles.nameBlock}>
                <Text style={[styles.name, { color: isYou ? C.accentBright : C.text }]}>
                  {isYou ? "Sen" : memberName}
                </Text>
                <Text style={[styles.role, { color: C.text3 }]}>
                  {isMemberAdmin ? "Kurucu" : "Üye"}
                </Text>
              </View>

              {canRemove ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${member.display_name} adlı üyeyi çıkar`}
                  onPress={() => {
                    H.warn();
                    onRemoveMember?.(member);
                  }}
                  style={({ pressed }) => [
                    styles.removeBtn,
                    { backgroundColor: C.void, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Icon name="x" size={14} color={C.danger} />
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: SHAPE.card,
    borderWidth: 1,
    padding: STEP.s3,
    marginBottom: STEP.s3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: STEP.s2,
  },
  label: {
    ...TYPOGRAPHY.label,
  },
  countText: {
    ...TYPOGRAPHY.micro,
  },
  list: {
    gap: SPACING.xs / 2,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: STEP.s1,
    borderBottomWidth: 1,
  },
  nameBlock: {
    flex: 1,
    marginLeft: STEP.s1,
  },
  name: {
    ...TYPOGRAPHY.micro,
  },
  role: {
    ...TYPOGRAPHY.micro,
    marginTop: 1,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: SHAPE.chip,
    alignItems: "center",
    justifyContent: "center",
  },
});
