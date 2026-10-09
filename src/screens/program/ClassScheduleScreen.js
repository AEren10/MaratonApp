import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Button, Icon, Skeleton } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { weekdayIndex } from "../../domain/program/dayKeys";
import { useClassScheduleEditor } from "../../hooks/useClassScheduleEditor";
import { todayTR } from "../../lib/dateUtils";
import { formatNumber } from "../../lib/format";
import * as H from "../../lib/haptics";
import { openProgram } from "../../navigation/openProgram";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { RouteHeader } from "../roadmap/components/RouteHeader";
import ScheduleDayRow from "./components/ScheduleDayRow";

function ClassScheduleInner() {
  const C = useC();
  const navigation = useNavigation();
  const editor = useClassScheduleEditor();
  const today = weekdayIndex(todayTR());

  const onSubmit = useCallback(async () => {
    await editor.submit();
    H.success();
    if (navigation.canGoBack()) navigation.goBack();
    else openProgram(navigation);
  }, [editor, navigation]);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <RouteHeader title="Haftalık ders programı" onBack={() => (navigation.canGoBack() ? navigation.goBack() : openProgram(navigation))} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[TYPOGRAPHY.body, s.lede, { color: C.text3 }]}>
          Hangi gün hangi derse çalıştığını söyle, rota durakları o günlere düşsün.
        </Text>
        {editor.loading ? (
          <Skeleton height={380} radius={SHAPE.panel} style={s.list} />
        ) : (
          <View style={s.list}>
            {editor.draft.map((day) => (
              <ScheduleDayRow
                key={day.weekday}
                day={day}
                isToday={day.weekday === today}
                isLast={day.weekday === 6}
                open={editor.open === day.weekday}
                editor={editor}
              />
            ))}
          </View>
        )}
        <View style={[s.total, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[s.totalIcon, { backgroundColor: C.accent + "18", borderColor: C.accent + "30" }]}>
            <Icon name="clock" size={16} color={C.accent} />
          </View>
          <View style={s.totalInfo}>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Haftalık planlanan süre</Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>Ders günlerine göre otomatik hesaplandı</Text>
          </View>
          <View style={s.totalNumberRow}>
            <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{formatNumber(editor.totalHours, editor.totalHours % 1 ? 1 : 0)}</Text>
            <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginLeft: 2 }]}>sa</Text>
          </View>
        </View>
        <View style={s.cta}>
          <Button variant="primary" size="lg" fullWidth loading={editor.saving} onPress={onSubmit}>
            Rotayı bu programa göre çiz
          </Button>
        </View>
        <Text style={[TYPOGRAPHY.meta, s.foot, { color: C.text3 }]}>
          Boş gün bırakmak rotayı bozmaz — plan motoru onu hesaba katar.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ClassScheduleScreen() {
  return (
    <ScreenErrorBoundary>
      <ClassScheduleInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: STEP.s4 },
  lede: { marginTop: STEP.s3 },
  list: { marginTop: STEP.s4 },
  total: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    marginTop: STEP.s5,
    paddingVertical: STEP.s3,
    paddingHorizontal: STEP.s3,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
  },
  totalIcon: {
    width: 36,
    height: 36,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  totalInfo: { flex: 1, gap: 2 },
  totalNumberRow: { flexDirection: "row", alignItems: "baseline" },
  cta: { marginTop: STEP.s5 },
  foot: { marginTop: STEP.s4, textAlign: "center" },
});
