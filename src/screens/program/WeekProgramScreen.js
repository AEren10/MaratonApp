import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { Button, EmptyState, Skeleton } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { useWeekStops } from "../../hooks/useWeekStops";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { RouteHeader } from "../roadmap/components/RouteHeader";
import { WeekDayStrip } from "../dersler/components/WeekDayStrip";
import ProgramAgendaItem from "./components/ProgramAgendaItem";

function plannedLabel(minutes) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const text = h > 0 ? `${h} saat${m ? ` ${m} dk` : ""}` : `${m} dk`;
  return `${text} planlı`;
}

// Tasarim AKIS 7 · "Program" — gun seridi + secili gunun rota duraklari.
function WeekProgramInner() {
  const C = useC();
  const navigation = useNavigation();
  const p = useWeekStops();

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <RouteHeader
        title="Program"
        onBack={() => navigation.goBack()}
        onMore={() => navigation.navigate(SCREENS.CALENDAR)}
        moreIcon="calendar"
        moreLabel="Takvim"
      />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {p.loading ? (
          <View style={s.gap}>
            <Skeleton height={76} radius={SHAPE.cardTight} />
            <Skeleton height={220} radius={SHAPE.panel} />
          </View>
        ) : (
          <>
            <WeekDayStrip days={p.days} selectedDate={p.selected} onSelect={p.setSelected} />
            <Animated.View key={p.selected} entering={FadeIn.duration(500)} style={s.dayHead}>
              <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>{p.dayLabel}</Text>
              {plannedLabel(p.plannedMinutes) ? (
                <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{plannedLabel(p.plannedMinutes)}</Text>
              ) : null}
            </Animated.View>
            {p.agenda.length ? (
              <Animated.View entering={FadeInDown.duration(600)} style={s.agenda}>
                {p.agenda.map((item) => <ProgramAgendaItem key={item.key} item={item} />)}
              </Animated.View>
            ) : (
              <EmptyState preset="calendarEmptyDay" primary="" secondary="" style={s.empty} />
            )}
          </>
        )}
        <View style={s.cta}>
          <Button variant="primary" size="lg" fullWidth onPress={() => navigation.navigate(SCREENS.ADD_TASK)}>
            Durak ekle
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function WeekProgramScreen() {
  return (
    <ScreenErrorBoundary>
      <WeekProgramInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s4 },
  gap: { gap: STEP.s2 },
  dayHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: STEP.s4 - 6 },
  agenda: { marginTop: STEP.s1 },
  empty: { marginTop: STEP.s3 },
  cta: { marginTop: STEP.s3 + 2 },
});
