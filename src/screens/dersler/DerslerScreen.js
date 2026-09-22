import React from "react";
import { ScrollView, View, Text, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { SCREENS } from "../../constants/screens";
import { openInTab, TAB_KEYS } from "../../navigation/tabJump";
import { Icon, Button } from "../../components/design";
import { STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useWeekProgram } from "../../hooks/useWeekProgram";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { DerslerSkeleton } from "./components/DerslerSkeleton";
import { WeekProgressCard } from "./components/WeekProgressCard";
import { WeekDayStrip } from "./components/WeekDayStrip";
import { SelectedDayPanel } from "./components/SelectedDayPanel";
import { ProgramRulesSection } from "./components/ProgramRulesSection";
import SegmentTabs from "../../components/common/SegmentTabs";

const TABS = [{ key: "week", label: "Haftalık" }, { key: "month", label: "Aylık" }];
// Mufredat ekranindaki segmentin AYNISI, ters yonu. Gecis eskiden tek
// yonluydu: Mufredat'tan Programim'a gelinebiliyor ama geri donulemiyordu,
// ogrenci sekmeye basip bastan baslamak zorunda kaliyordu.
const SECTIONS = [
  { key: "curriculum", label: "Müfredat" },
  { key: "program", label: "Programım" },
];

function Header({ C, navigation }) {
  // Tasarım (Image 3) gereği, bu ekranda '< Programım' başlığı var.
  // Kök ekran olsa bile görsel olarak geri tuşunu tasarım istiyor olabilir 
  // (ya da müfredattan vs push edilmiş olabilir).
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 4 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Geri"
        hitSlop={10}
        onPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else openInTab(navigation, TAB_KEYS.PROGRAM, SCREENS.CURRICULUM_MAP);
        }}
        style={{ width: 40, height: 44, justifyContent: "center" }}
      >
        <Icon name="chevL" size={17} color={C.text} />
      </Pressable>
      <Text style={{ flex: 1, fontFamily: "Bricolage_400", fontSize: 22, color: C.text }}>
        Programım
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Takvim"
        hitSlop={10}
        onPress={() => navigation.navigate(SCREENS.CALENDAR)}
        style={{ width: 44, height: 44, alignItems: "flex-end", justifyContent: "center" }}
      >
        <Icon name="calendar" size={19} color={C.text3} />
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

          <View style={{ marginTop: STEP.s2 }}>
            <SegmentTabs
              options={SECTIONS}
              value="program"
              onChange={(key) => {
                if (key === "curriculum") openInTab(navigation, TAB_KEYS.PROGRAM, SCREENS.CURRICULUM_MAP);
              }}
            />
          </View>

          {loading ? (
            <DerslerSkeleton />
          ) : (
            <>
              <WeekProgressCard
                rangeLabel={weekRangeLabel}
                activeDaysCount={activeDaysCount}
                totalMinutes={totalMinutes}
                totalQuestions={totalQuestions}
              />

              <View style={{ marginTop: STEP.s3 }}>
                <SegmentTabs options={TABS} value="week" onChange={() => navigation.navigate(SCREENS.CALENDAR)} />
              </View>

              <WeekDayStrip days={days} selectedDate={selectedDate} onSelect={setSelectedDate} />

              {selectedDay && (
                <SelectedDayPanel selectedDay={selectedDay} logs={selectedDayLogs} />
              )}

              <ProgramRulesSection onOpen={() => navigation.navigate(SCREENS.CLASS_SCHEDULE)} />

              <View style={{ marginTop: STEP.s4 }}>
                <Button variant="outline" size="lg" fullWidth onPress={() => navigation.navigate(SCREENS.TOPIC_DEBT)} style={{ marginBottom: STEP.s2 }}>
                  Geriye Dönük Borçlar
                </Button>
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
        </ScrollView>
      </SafeAreaView>
    </ScreenErrorBoundary>
  );
}
