import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

function shortMinutes(minutes) {
  if (!minutes) return "0 dk";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h} sa${m ? ` ${m} dk` : ""}`;
  return `${m} dk`;
}

function WeekSummary({ p, C, onMonth }) {
  const ratio = p.totalStops > 0 ? p.completedStops / p.totalStops : 0;
  return (
    <View style={[s.summary, { backgroundColor: C.surface, borderColor: C.elev }]}>
      <View style={s.summaryHead}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BU HAFTA</Text>
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>{p.weekRange}</Text>
      </View>
      <View style={s.summaryHero}>
        <Text style={[TYPOGRAPHY.statPosterSide, { color: C.text }]}>{p.completedStops}</Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>
          / {p.totalStops} durak tamamlandı
        </Text>
      </View>
      <View style={[s.progressTrack, { backgroundColor: C.track }]}>
        <View style={[s.progressFill, { width: `${Math.round(ratio * 100)}%`, backgroundColor: C.accent }]} />
      </View>
      <View style={s.summaryFoot}>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{shortMinutes(p.weeklyCompletedMinutes)} çalışıldı</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{shortMinutes(p.weeklyPlannedMinutes)} planlı</Text>
      </View>
      <View style={[s.segment, { backgroundColor: C.void, borderColor: C.line }]}>
        <View style={[s.segmentActive, { backgroundColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>Haftalık</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onMonth} style={s.segmentIdle}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>Aylık</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Tasarim AKIS 7 · "Program" — gun seridi + secili gunun rota duraklari.
function WeekProgramInner() {
  const C = useC();
  const navigation = useNavigation();
  const p = useWeekStops();

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <RouteHeader
        title="Programım"
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
            <WeekSummary p={p} C={C} onMonth={() => navigation.navigate(SCREENS.MONTH_PLAN)} />
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
            Bugüne durak ekle
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
  summary: { padding: STEP.s3, borderRadius: SHAPE.sheet, borderWidth: 1 },
  summaryHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  summaryHero: { flexDirection: "row", alignItems: "baseline", marginTop: STEP.s1 },
  progressTrack: { height: 4, borderRadius: STEP.s1 / 8, overflow: "hidden", marginTop: STEP.s2 },
  progressFill: { height: "100%", borderRadius: STEP.s1 / 8 },
  summaryFoot: { flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s1 },
  segment: { flexDirection: "row", padding: STEP.s1 / 2, borderRadius: SHAPE.chip, borderWidth: 1, marginTop: STEP.s3 },
  segmentActive: { flex: 1, minHeight: 34, alignItems: "center", justifyContent: "center", borderRadius: SHAPE.chip - 2 },
  segmentIdle: { flex: 1, minHeight: 34, alignItems: "center", justifyContent: "center", borderRadius: SHAPE.chip - 2 },
  dayHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: STEP.s4 - 6 },
  agenda: { marginTop: STEP.s1 },
  empty: { marginTop: STEP.s3 },
  cta: { marginTop: STEP.s3 + 2 },
});
