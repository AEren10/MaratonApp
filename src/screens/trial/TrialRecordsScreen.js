import React, { useCallback } from "react";
import { View, Text, SectionList, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useC } from "../../contexts/ThemeContext";
import { GUTTER } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { Icon, EmptyState, ErrorState } from "../../components/design";
import { useTrialRecords } from "../../hooks/useTrialRecords";
import { TrialRecordFilters } from "./components/TrialRecordFilters";
import { TrialRecordRow } from "./components/TrialRecordRow";
import { TrialRecordUnlockCard } from "./components/TrialRecordUnlockCard";
import { TrialRecordsSkeleton } from "./components/TrialRecordsSkeleton";
import { Press } from "../../components/design/Press";

export default function TrialRecordsScreen() {
  const C = useC();
  const navigation = useNavigation();
  const {
    filter, setFilter, typeTabs, sections, lockedCount,
    totalCount, requestFullHistory, isEmpty, loading, error, retry,
  } = useTrialRecords();

  const openTrial = useCallback(
    (trial) => navigation.navigate(SCREENS.TRIAL_DETAIL, { trial }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }) => <TrialRecordRow item={item} C={C} onPress={openTrial} />,
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
        <Press haptic="none"
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Geri"
          style={styles.backBtn}
        >
          <Icon name="arrowL" size={18} color={C.text2} />
        </Press>
        <Text style={[styles.title, { color: C.text }]}>Deneme kayıtları</Text>
        <Text style={[styles.count, { color: C.text3 }]}>{totalCount}</Text>
      </View>

      {isEmpty && loading ? (
        <TrialRecordsSkeleton />
      ) : error ? (
        <ErrorState preset="server" onPrimary={retry} code={error.code} style={{ paddingHorizontal: GUTTER }} />
      ) : isEmpty ? (
        <EmptyState preset="trialRecords" style={{ paddingHorizontal: GUTTER }} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
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
