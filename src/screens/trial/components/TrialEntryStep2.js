import { useCallback, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { Button } from "../../../components/design";
import { TrialEntryFooter } from "./TrialEntryFooter";
import { useC } from "../../../contexts/ThemeContext";
import { STEP } from "../../../themes/tokens";
import { EMPTY_TRIAL_SCORE } from "../../../domain/trial/trialEntryModel";
import { getTrialTypes } from "../../../domain/trial/trialTypes";
import { useTrialEntryPrevious } from "../useTrialEntryPrevious";
import { TrialSubjectScoreRow } from "./TrialSubjectScoreRow";
import { TotalCard } from "./TotalCard";

function shortDate(date) {
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

// Deneme Gir 2/3: ders bazinda net dokumu; Form Hatasi ilgili dersin icinde.
export function TrialEntryStep2({ form, styles, overflow, onNext }) {
  const C = useC();
  const typeMeta = useMemo(() => getTrialTypes(C)[form.trialType], [C, form.trialType]);
  const headerLabel = `${typeMeta?.label || form.trialType} · ${shortDate(form.trialDate)}`.toLocaleUpperCase("tr-TR");
  const previous = useTrialEntryPrevious({ trialType: form.trialType, branchSubject: form.branchSubject });

  const handleFix = useCallback((info) => {
    const current = form.values[info.subjectKey] || EMPTY_TRIAL_SCORE;
    form.handleScoreChange(info.subjectKey)({ ...current, [info.field]: String(info.fixedValue) });
  }, [form]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View>
          <Text style={styles.label}>{headerLabel}</Text>
          <Text style={[styles.body, { marginTop: 6 }]}>Sayıya dokun, klavyeyle yaz. Artı-eksi ince ayar için.</Text>
        </Animated.View>
        <Animated.View style={{ marginTop: STEP.s3 + 2 }}>
          {form.subjects.map((subject) => (
            <TrialSubjectScoreRow key={subject.key} subject={subject}
              values={form.values[subject.key] || EMPTY_TRIAL_SCORE}
              onChange={form.handleScoreChange(subject.key)} wrongPenalty={form.wrongPenalty}
              overflow={overflow?.subjectKey === subject.key ? overflow : null} onFix={handleFix} />
          ))}
        </Animated.View>
        <Animated.View style={{ marginTop: STEP.s3 + 6 }}>
          <TotalCard totalNet={form.totalNet} previousNet={previous?.totalNet} styles={styles} />
        </Animated.View>
      </ScrollView>
        <TrialEntryFooter>
          <Button size="lg" onPress={onNext} fullWidth disabled={!!overflow}>
            Devam
          </Button>
        </TrialEntryFooter>
    </View>
  );
}
