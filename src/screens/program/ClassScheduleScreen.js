import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Button, Skeleton } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { weekdayIndex } from "../../domain/program/dayKeys";
import { useClassScheduleEditor } from "../../hooks/useClassScheduleEditor";
import { todayTR } from "../../lib/dateUtils";
import { formatNumber } from "../../lib/format";
import * as H from "../../lib/haptics";
import { TAB_KEYS } from "../../navigation/tabAssignment";
import { openInTab } from "../../navigation/tabJump";
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
    openInTab(navigation, TAB_KEYS.PROGRAM, SCREENS.WEEK_PROGRAM);
  }, [editor, navigation]);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <RouteHeader title="Haftalık ders programı" onBack={() => navigation.goBack()} />
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
        <View style={[s.total, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.meta, s.flex, { color: C.text2 }]}>Haftalık toplam</Text>
          <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{formatNumber(editor.totalHours, editor.totalHours % 1 ? 1 : 0)}</Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>sa</Text>
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
  total: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: STEP.s5, paddingVertical: STEP.s3 - 2, paddingHorizontal: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1 },
  flex: { flex: 1 },
  cta: { marginTop: STEP.s5 },
  foot: { marginTop: STEP.s4, textAlign: "center" },
});
