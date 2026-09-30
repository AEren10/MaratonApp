import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { Press } from "../../components/design/Press";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { useAlert } from "../../contexts/AlertContext";
import { useRouteHabits } from "../../hooks/useRouteHabits";
import { HABIT_QUESTION_RANGE, presetsForExam } from "../../domain/route/habits";
import { GUTTER, STEP, TYPOGRAPHY, NAV_ICON } from "../../themes/tokens";
import { HabitRow } from "./components/HabitRow";

// GUNLUK RUTIN: her gun cozulecek turler. Rota bunlari her calisma gununun
// basina ekler ve haftalik yukten duser (domain/route/habits).
export default function RouteHabitsScreen() {
  const C = useC();
  const navigation = useNavigation();
  const showAlert = useAlert();
  const { examType } = useExam();
  const { saved, save, loaded } = useRouteHabits();
  const presets = presetsForExam(examType);

  const commit = useCallback(async (next) => {
    const ok = await save(next);
    if (!ok) showAlert("Kaydedilemedi", "Rutin kaydedilemedi. Bağlantını kontrol et.");
  }, [save, showAlert]);

  const toggle = (preset, on) => commit(on
    ? [...saved.filter((h) => h.key !== preset.key), { key: preset.key, questions: preset.questions }]
    : saved.filter((h) => h.key !== preset.key));

  const step = (preset, delta) => {
    const [lo, hi] = HABIT_QUESTION_RANGE;
    commit(saved.map((h) => (h.key === preset.key
      ? { ...h, questions: Math.min(hi, Math.max(lo, (Number(h.questions) || preset.questions) + delta)) }
      : h)));
  };

  return (
    <SafeAreaView edges={["top"]} style={[s.fill, { backgroundColor: C.bg }]}>
      <View style={s.header}>
        <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
        </Press>
        <Text style={[TYPOGRAPHY.subheading, s.flex, { color: C.text }]}>Günlük rutin</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[TYPOGRAPHY.body, { color: C.text2 }]}>
          Her gün çözmek istediğin türleri seç. Rota bunları her çalışma gününün başına ekler; haftalık
          yükü buna göre hafifletir. Problem rutini her gün en zayıf olduğun problem türünü verir.
        </Text>
        {!loaded ? (
          <Text style={[TYPOGRAPHY.meta, s.list, { color: C.text3 }]}>Rutinlerin yükleniyor…</Text>
        ) : null}
        <View style={[s.list, !loaded && s.locked]} pointerEvents={loaded ? "auto" : "none"}>
          {presets.map((preset, i) => {
            const current = saved.find((h) => h.key === preset.key);
            return (
              <HabitRow
                key={preset.key}
                C={C}
                first={i === 0}
                preset={preset}
                enabled={!!current}
                questions={current ? Number(current.questions) || preset.questions : preset.questions}
                onToggle={(on) => toggle(preset, on)}
                onStep={(delta) => step(preset, delta)}
              />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingHorizontal: GUTTER, paddingVertical: STEP.s2 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: STEP.s5 },
  list: { marginTop: STEP.s3 },
  locked: { opacity: 0.5 },
});
