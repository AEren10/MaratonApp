import { View, Text, StyleSheet } from "react-native";

import { Press } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { PREVIEW_DAILY_OPTIONS } from "../../../domain/onboarding/routePreview";
import * as H from "../../../lib/haptics";
import { ExamOption } from "./ExamOption";

function Chips({ items, value, onPick, C, label }) {
  return (
    <View style={s.chips}>
      {items.map((it) => {
        const on = value === it.id;
        return (
          <Press
            key={it.id}
            haptic="none"
            onPress={() => { H.select(); onPick(it.id); }}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${label}: ${it.label}`}
            style={[s.chip, { backgroundColor: on ? C.elev : C.surface, borderColor: on ? C.text2 : C.border }]}
          >
            <Text style={[TYPOGRAPHY.captionMedium, { color: on ? C.text : C.text2 }]}>{it.label}</Text>
          </Press>
        );
      })}
    </View>
  );
}

// Onizlemenin uc sorusu tek ekranda: sinav (+ alan), sinav yili, gunluk sure.
export function PreviewChoices({ f, C }) {
  return (
    <View>
      <Text style={[TYPOGRAPHY.heading, s.title, { color: C.text }]}>Rotanı şimdi çizelim.</Text>
      <Text style={[TYPOGRAPHY.body, s.lead, { color: C.text3 }]}>
        Üç soru. Hesap açmadan önce rotanın ilk duraklarını göreceksin.
      </Text>

      <Text style={[TYPOGRAPHY.label, s.section, { color: C.text2 }]}>SINAV</Text>
      <View style={s.col}>
        {f.categories.map((opt) => (
          <ExamOption key={opt.id} item={opt} selected={f.category} onPress={f.pickCategory} C={C} />
        ))}
      </View>
      {f.category === "yks" ? (
        <View style={[s.col, s.sub]}>
          {f.yksOptions.map((opt) => (
            <ExamOption key={opt.id} item={opt} selected={f.optionId} onPress={f.setOptionId} C={C} />
          ))}
        </View>
      ) : null}

      {f.category ? (
        <>
          <Text style={[TYPOGRAPHY.label, s.section, { color: C.text2 }]}>SINAV YILI</Text>
          <Chips C={C} label="Sınav" value={f.month} onPick={f.setMonth}
            items={f.months.map((m) => ({ id: m, label: m }))} />

          <Text style={[TYPOGRAPHY.label, s.section, { color: C.text2 }]}>GÜNDE NE KADAR AYIRABİLİRSİN?</Text>
          <Chips C={C} label="Günlük süre" value={f.dailyId} onPick={f.setDailyId} items={PREVIEW_DAILY_OPTIONS} />
        </>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 26, marginTop: STEP.s2 },
  lead: { marginTop: STEP.s1 },
  section: { marginTop: STEP.s4, marginBottom: STEP.s2 },
  col: { gap: STEP.s1 },
  sub: { marginTop: STEP.s2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1 },
  chip: {
    minHeight: CONTROL.tapMin, paddingHorizontal: STEP.s3, borderRadius: SHAPE.chip, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
});
