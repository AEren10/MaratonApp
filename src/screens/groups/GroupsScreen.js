import { View, FlatList, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { GUTTER, STEP } from "../../themes/tokens";
import { useGroups } from "../../hooks/useGroups";
import { GroupsHeader } from "./components/GroupsHeader";
import { GroupCard } from "./components/GroupCard";
import { GroupsEmptyState } from "./components/GroupsEmptyState";
import { GroupsSkeleton } from "./components/GroupsSkeleton";
import { Button } from "../../components/design/Button";

export default function GroupsScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { groups, loading, refresh } = useGroups();

  const handleSelectGroup = (group) => {
    navigation.navigate(SCREENS.GROUP_DETAIL, { groupId: group.id, groupName: group.name });
  };

  const renderItem = ({ item }) => (
    <GroupCard group={item} onPress={handleSelectGroup} />
  );

  return (
    <SafeAreaView edges={["top"]} style={[styles.safeArea, { backgroundColor: C.bg }]}>
      <GroupsHeader onAddPress={() => navigation.navigate(SCREENS.CREATE_GROUP)} />

      {loading ? (
        <GroupsSkeleton />
      ) : groups.length === 0 ? (
        <GroupsEmptyState />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor={C.accent}
              colors={[C.accent]}
            />
          }
          ListFooterComponent={
            <View style={styles.footerRow}>
              <Button
                title="Koda Katıl"
                variant="outline"
                size="md"
                fullWidth
                icon="hash"
                onPress={() => navigation.navigate(SCREENS.JOIN_GROUP)}
              />
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2,
    paddingBottom: STEP.s5 + STEP.s4,
  },
  footerRow: {
    marginTop: STEP.s3,
    marginBottom: STEP.s5,
  },
});
