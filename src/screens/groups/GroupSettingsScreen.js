import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Icon } from "../../components/design/Icon";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL, GUTTER } from "../../themes/tokens";
import { useGroupDetail } from "../../hooks/useGroupDetail";
import { GroupInfoEditCard } from "./components/GroupInfoEditCard";
import { GroupMembersList } from "./components/GroupMembersList";
import { GroupDangerZone } from "./components/GroupDangerZone";
import { useGroupSettingsActions } from "./useGroupSettingsActions";
import * as H from "../../lib/haptics";

export default function GroupSettingsScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, groupName: initialName, code: initialCode, role: initialRole } = route.params || {};
  const { group, leaderboard, setGroup, setLeaderboard } = useGroupDetail(groupId);

  const [groupName, setGroupName] = useState(group?.name || initialName || "");
  const [groupCode, setGroupCode] = useState(group?.code || initialCode || "");
  const isAdmin = (group?.role || initialRole) === "admin";

  const {
    handleSaveName,
    handleRegenerateCode,
    handleRemoveMember,
    handleLeave,
    handleDelete,
    busy,
  } = useGroupSettingsActions({
    groupId,
    setGroupName,
    setGroupCode,
    setGroup,
    setLeaderboard,
  });

  return (
    <SafeAreaView edges={["top"]} style={[styles.safeArea, { backgroundColor: C.bg }]}>
      <View style={[styles.header, { borderBottomColor: C.line }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Geri"
          onPress={() => {
            H.tap();
            navigation.goBack();
          }}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: C.surface, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Icon name="chevL" size={20} color={C.text} />
        </Pressable>
        <Text style={[styles.title, { color: C.text }]}>Grup Ayarları</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <GroupInfoEditCard
          name={groupName}
          code={groupCode}
          isAdmin={isAdmin}
          onSaveName={handleSaveName}
          onRegenerateCode={handleRegenerateCode}
          busy={busy}
        />

        <GroupMembersList
          members={leaderboard}
          isAdmin={isAdmin}
          onRemoveMember={handleRemoveMember}
        />

        <GroupDangerZone
          isAdmin={isAdmin}
          onLeave={handleLeave}
          onDelete={handleDelete}
          busy={busy}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  backBtn: {
    width: CONTROL.buttonTertiary,
    height: CONTROL.buttonTertiary,
    borderRadius: SHAPE.iconBox,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...TYPOGRAPHY.subheading },
  placeholder: { width: CONTROL.buttonTertiary },
  scrollContent: {
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s3,
    paddingBottom: STEP.s5,
  },
});
