import React, { useCallback } from "react";
import { View, Text, Pressable, SectionList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { Icon, EmptyState, SectionLabel } from "../../components/design";
import { useTrialRecords } from "../../hooks/useTrialRecords";
import { TrialRecordFilters } from "./components/TrialRecordFilters";
import { TrialRecordRow } from "./components/TrialRecordRow";
import { TrialRecordUnlockCard } from "./components/TrialRecordUnlockCard";
import { TrialRecordTopicLink } from "./components/TrialRecordTopicLink";

export default function TrialRecordsScreen() {
  const C = useC();
  const navigation = useNavigation();
  const {
    filter, setFilter, typeTabs, sections, lockedCount,
    totalCount, requestFullHistory, isEmpty,
  } = useTrialRecords();

  const openTrial = useCallback(
    (trial) => navigation.navigate(SCREENS.TRIAL_DETAIL, { trial }),
    [navigation],
  );
  const openSubjects = useCallback(
    () => navigation.navigate(SCREENS.SUBJECT_LIST),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40)}>
        <TrialRecordRow item={item} C={C} onPress={openTrial} />
      </Animated.View>
    ),
    [C, openTrial],
  );

  const renderSectionHeader = useCallback(
    ({ section }) => <SectionLabel style={styles.sectionLabel}>{section.title}</SectionLabel>,
    [],
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Geri"
        >
          <Icon name="arrowL" size={20} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: STEP.s2 }]}>
          Deneme kayıtları
        </Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]} allowFontScaling={false}>
          {totalCount}
        </Text>
      </View>

      {isEmpty ? (
        <EmptyState preset="trialRecords" style={{ paddingHorizontal: GUTTER }} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <TrialRecordFilters tabs={typeTabs} active={filter} onChange={setFilter} C={C} />
          }
          ListFooterComponent={
            <>
              <TrialRecordUnlockCard lockedCount={lockedCount} onPress={requestFullHistory} C={C} />
              <TrialRecordTopicLink onPress={openSubjects} C={C} />
            </>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  list: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s5 },
  sectionLabel: { marginTop: STEP.s3, marginBottom: STEP.s1 },
});
