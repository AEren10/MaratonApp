import React, { useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, EmptyState, SectionLabel } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { useWeakAreas } from "../../hooks/useWeakAreas";
import { WeakAreaRow } from "./components/WeakAreaRow";

export default function WeakAreasScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { weakTopics, isEmpty } = useWeakAreas();

  const handleStudy = useCallback((item) => {
    navigation.navigate(SCREENS.TOPIC_STUDY, {
      topic: { name: item.name, acc: item.acc },
      subject: item.subject,
    });
  }, [navigation]);

  const renderItem = useCallback(
    ({ item, index }) => (
      <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40)} style={styles.rowWrap}>
        <WeakAreaRow item={item} C={C} onPress={handleStudy} />
      </Animated.View>
    ),
    [C, handleStudy],
  );
  const keyExtractor = useCallback((item, i) => `${item.subject.key}-${item.name}-${i}`, []);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Geri"
        >
          <Icon name="arrowL" size={20} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>ÖNCELİKLİ KONULAR</Text>
      </View>

      {isEmpty ? (
        <EmptyState
          preset="priorityTopics"
          style={styles.empty}
          onPrimary={() => navigation.navigate(SCREENS.ROADMAP)}
          onSecondary={() => navigation.navigate(SCREENS.SUBJECT_LIST)}
        />
      ) : (
        <FlatList
          data={weakTopics}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          windowSize={5}
          maxToRenderPerBatch={10}
          ListHeaderComponent={
            <View style={styles.hero}>
              <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>
                Rotanda geride kalan konular
              </Text>
              <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s2 }]}>
                Sıralama son beş denemenin ders bazlı ortalamasına göre yapılır.
              </Text>
              <SectionLabel style={styles.sectionLabel}>{weakTopics.length} KONU</SectionLabel>
            </View>
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
    gap: STEP.s2,
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
  },
  hero: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: STEP.s3 },
  sectionLabel: { marginTop: STEP.s4, marginBottom: 0 },
  list: { paddingBottom: STEP.s5 },
  rowWrap: { paddingHorizontal: GUTTER, marginTop: STEP.s1 },
  empty: { flex: 1, paddingHorizontal: GUTTER, justifyContent: "center" },
});
