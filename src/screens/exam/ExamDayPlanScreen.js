import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button, ErrorState, Skeleton } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExamDayPlan } from "../../hooks/useExamDayPlan";
import { ExamScreenHeader } from "./components/ExamScreenHeader";
import { ExamPlanFieldsCard } from "./components/ExamPlanFieldsCard";
import { ExamBagList } from "./components/ExamBagList";
import { ExamReminderRow } from "./components/ExamReminderRow";

// Tasarim AKIS 14 · "Sınav günü planı". Girisler: Son Hafta (borclu) modunun
// "Sınav günü planı" satiri/butonu, Rota Tamamlandi modali, Profil satiri ve
// sinav arifesi bildirimi. Veri cihazda; hatirlatma kayitla kurulur.
const FADE = (delay) => FadeInDown.delay(delay).duration(500);

export default function ExamDayPlanScreen() {
  const C = useC();
  const p = useExamDayPlan();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <ExamScreenHeader title="Sınav günü planı" onBack={p.back} />
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={[TYPOGRAPHY.caption, s.intro, { color: C.text2 }]}>
            Sınav sabahını şimdi kur. Kaydettiğinde bir gün önce hatırlatma gelir.
          </Text>

          {p.status === "loading" ? <PlanSkeleton /> : null}

          {p.status === "error" ? (
            <ErrorState preset="server" onPrimary={p.retry} style={s.block} />
          ) : null}

          {p.status === "ready" ? (
            <>
              <Animated.View entering={FADE(70)} style={s.block}>
                <ExamPlanFieldsCard draft={p.draft} leaveAtInvalid={p.leaveAtInvalid} onChange={p.setField} />
              </Animated.View>

              <Animated.View entering={FADE(140)} style={s.block}>
                <ExamBagList items={p.items} onToggle={p.toggleItem} onAdd={p.addExtra} />
              </Animated.View>

              <Animated.View entering={FADE(210)} style={s.block}>
                <ExamReminderRow on={p.draft.remind} caption={p.draft.remind ? p.caption : null} onToggle={p.toggleRemind} />
              </Animated.View>

              <Animated.View entering={FADE(280)} style={s.cta}>
                <Button size="lg" fullWidth onPress={p.save} loading={p.saving} disabled={!p.canSave}>
                  Planı kaydet
                </Button>
              </Animated.View>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PlanSkeleton() {
  return (
    <View style={s.block}>
      <Skeleton height={236} radius={SHAPE.sheet} />
      <Skeleton height={14} width={60} style={s.skelGap} />
      <Skeleton height={220} radius={SHAPE.panel} style={s.skelGap} />
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: STEP.s4 + 6 },
  intro: { marginTop: STEP.s3 + 2, maxWidth: 300 },
  block: { marginTop: STEP.s3 + 4 },
  cta: { marginTop: STEP.s3 + 6 },
  skelGap: { marginTop: STEP.s3 },
});
