import { useCallback, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { SPACING, TYPOGRAPHY } from "../../../themes/tokens";
import { EMPTY_TRIAL_SCORE } from "../../../domain/trial/trialEntryModel";
import { getTrialTypes } from "../../../domain/trial/trialTypes";
import { SubjectInput } from "./SubjectInput";
import { TotalCard } from "./TotalCard";

function shortDate(date) {
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long" }).toUpperCase();
}

// Deneme Gir 2/3: ders bazinda net dokumu ve toplam hata kontrolu.
export function TrialEntryStep2({ form, overflow, onNext }) {
  const C = useC();
  const typeMeta = useMemo(() => getTrialTypes(C)[form.trialType], [C, form.trialType]);
  const headerLabel = `${(typeMeta?.label || form.trialType).toUpperCase()} · ${shortDate(form.trialDate)}`;

  const handleFixOverflow = useCallback((info) => {
    const current = form.values[info.subjectKey] || EMPTY_TRIAL_SCORE;
    form.handleScoreChange(info.subjectKey)({ ...current, empty: String(info.fixedEmpty) });
  }, [form]);

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.huge }}
      showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.xs }]}>{headerLabel}</Text>
      <Text style={[TYPOGRAPHY.caption, { color: C.sec, marginBottom: SPACING.xl }]}>
        Sayıya dokun, klavyeyle yaz. Artı-eksi ince ayar için.
      </Text>
      <Animated.View entering={FadeInDown.delay(80).duration(420).springify()}>
        {form.subjects.map((subject) => (
          <SubjectInput key={subject.key} subject={subject}
            values={form.values[subject.key] || EMPTY_TRIAL_SCORE}
            onChange={form.handleScoreChange(subject.key)} wrongPenalty={form.wrongPenalty}
            error={overflow?.subjectKey === subject.key} />
        ))}
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(150).duration(420).springify()}>
        <TotalCard totalNet={form.totalNet} overflow={overflow} onFixOverflow={handleFixOverflow} />
      </Animated.View>
      <View style={{ marginTop: SPACING.md }}>
        <Button size="lg" onPress={onNext} fullWidth disabled={!!overflow}>
          Devam
        </Button>
      </View>
    </ScrollView>
  );
}
