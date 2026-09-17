import React, { useCallback } from "react";
import { View, Text, Pressable, SectionList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useC } from "../../contexts/ThemeContext";
import { GUTTER, STEP } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { Icon, EmptyState } from "../../components/design";
import { useTrialRecords } from "../../hooks/useTrialRecords";
import { TrialRecordFilters } from "./components/TrialRecordFilters";
import { TrialRecordRow } from "./components/TrialRecordRow";
import { TrialRecordUnlockCard } from "./components/TrialRecordUnlockCard";

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

  const renderItem = useCallback(
    ({ item, index }) => (
      <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 30)}>
        <TrialRecordRow item={item} C={C} onPress={openTrial} />
      </Animated.View>
    ),
    [C, openTrial],
  );

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <Text style={[styles.sectionLabel, { color: C.text2 }]}>
        {section.title?.toUpperCase()}
      </Text>
    ),
    [C],
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Geri"
          style={styles.backBtn}
        >
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[styles.title, { color: C.text }]}>Deneme kayıtları</Text>
        <Text style={[styles.count, { color: C.text3 }]}>{totalCount}</Text>
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
            <TrialRecordFilters
              tabs={typeTabs}
              active={filter}
              onChange={setFilter}
              C={C}
            />
          }
          ListFooterComponent={
            <TrialRecordUnlockCard
              lockedCount={lockedCount}
              onPress={requestFullHistory}
              C={C}
            />
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
    gap: 14,
    paddingHorizontal: GUTTER,
    paddingTop: 4,
    paddingBottom: 8,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    flex: 1,
    fontFamily: "Bricolage_400",
    fontSize: 22,
  },
  count: {
    fontFamily: "Archivo_500",
    fontSize: 12.5,
  },
  list: {
    paddingHorizontal: GUTTER,
    paddingTop: 10,
    paddingBottom: 50,
  },
  sectionLabel: {
    fontFamily: "Archivo_600",
    fontSize: 11.5,
    letterSpacing: 1.84,
    marginTop: 20,
    marginBottom: 4,
  },
});