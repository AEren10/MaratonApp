import React from "react";
import { ScrollView, View, Text, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { SCREENS } from "../../constants/screens";
import { Icon, Button } from "../../components/design";
import { STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useWeekProgram } from "../../hooks/useWeekProgram";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { WeekProgressCard } from "./components/WeekProgressCard";
import { WeekDayStrip } from "./components/WeekDayStrip";
import { SelectedDayPanel } from "./components/SelectedDayPanel";
import { SubjectsSection } from "./components/SubjectsSection";

function Header({ C, navigation }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingTop: 4 }}>
      <Text style={{ flex: 1, fontFamily: "Bricolage_400", fontSize: 22, color: C.text }}>
        Programım
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Takvim ve seri"
        hitSlop={10}
        onPress={() => navigation.navigate(SCREENS.CALENDAR)}
        style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
      >
        <Icon name="calendar" size={17} color={C.muted} />
      </Pressable>
    </View>
  );
}

export default function DerslerScreen() {
  const C = useC();
  const navigation = useNavigation();
  const {
    loading, weekRangeLabel, days, totalMinutes, totalQuestions, activeDaysCount,
    selectedDate, setSelectedDate, selectedDay, selectedDayLogs, refresh,
  } = useWeekProgram();

  return (
    <ScreenErrorBoundary>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={C.accent} colors={[C.accent]} />
          }
        >
          <Header C={C} navigation={navigation} />

          {loading ? (
            <View style={{ gap: STEP.s2, marginTop: STEP.s2 }}>
              <SkeletonCard height={140} rounded={20} />
              <SkeletonCard height={70} rounded={16} />
            </View>
          ) : (
            <>
              <WeekProgressCard
                rangeLabel={weekRangeLabel}
                activeDaysCount={activeDaysCount}
                totalMinutes={totalMinutes}
                totalQuestions={totalQuestions}
              />

              <WeekDayStrip days={days} selectedDate={selectedDate} onSelect={setSelectedDate} />

              {selectedDay && (
                <SelectedDayPanel selectedDay={selectedDay} logs={selectedDayLogs} />
              )}

              <View style={{ marginTop: STEP.s4 }}>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={() => navigation.navigate(SCREENS.ADD_TASK)}
                >
                  Bugüne durak ekle
                </Button>
              </View>
            </>
          )}

          <SubjectsSection />
        </ScrollView>
      </SafeAreaView>
    </ScreenErrorBoundary>
  );
}
