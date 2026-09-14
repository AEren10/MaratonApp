import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button, StatBlock } from "../../../components/design";
import { EyebrowHeader } from "../../../components/common/EyebrowHeader";
import { useC } from "../../../contexts/ThemeContext";
import { formatDelta, formatNumber } from "../../../lib/format";
import { numberWord } from "../../../lib/trWords";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import DebtWeekRow from "./DebtWeekRow";

const enter = (i) => FadeInDown.delay(i * 80).duration(600);

// Tasarim AKIS 7 · "Borç Dağıtıldı" — Konu Borcu'nun dagitim sonrasi hali.
// Dagitim once gosterilir; "Rotaya işle" kalici gecisi yapar.
export function DebtDistributedView({ view, totalHours, committing, onCommit, onUndo }) {
  const C = useC();
  const lede = [
    view.loadIncreasePct != null ? `Haftalık yükün %${view.loadIncreasePct} arttı.` : null,
    "Kalan durakların sırası değişmedi.",
  ].filter(Boolean).join(" ");
  const stats = [
    { key: "stops", value: formatNumber(view.firstWeek.stops), label: "durak" },
    { key: "q", value: formatNumber(view.firstWeek.questions), label: "soru" },
    view.firstWeek.minutesPerDay != null
      ? { key: "min", value: formatDelta(view.firstWeek.minutesPerDay), label: "dk / gün" }
      : null,
  ].filter(Boolean);

  return (
    <>
      <EyebrowHeader label="BORÇ DAĞITIMI" onBack={onUndo} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={enter(0)}>
          <Text style={[TYPOGRAPHY.heading, s.headline, { color: C.text }]}>
            {`${totalHours} sa ${numberWord(view.weekCount)} haftaya bölündü.`}
          </Text>
          <Text style={[TYPOGRAPHY.body, s.lede, { color: C.text3 }]}>{lede}</Text>
        </Animated.View>
        <Animated.View entering={enter(1)} style={s.rows}>
          {view.rows.map((row) => <DebtWeekRow key={row.key} row={row} />)}
        </Animated.View>
        <Text style={[TYPOGRAPHY.label, s.section, { color: C.text2 }]}>YENİ HAFTALIK YÜK</Text>
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
          {stats.map((st) => (
            <View key={st.key}>
              <StatBlock value={st.value} size="value" color={C.text} />
              <Text style={[TYPOGRAPHY.micro, s.statLabel, { color: C.text3 }]}>{st.label}</Text>
            </View>
          ))}
        </View>
        <View style={[s.note, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>
            Dağıtım kesinleşmeden rotaya işlenmez. Geri al dersen borç olduğu gibi bekler, hiçbir durak silinmez.
          </Text>
        </View>
        <View style={s.actions}>
          <Button variant="primary" size="lg" fullWidth loading={committing} onPress={onCommit}>
            Rotaya işle
          </Button>
          <Button variant="ghost" size="md" fullWidth onPress={onUndo}>Geri al</Button>
        </View>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 - 2, paddingBottom: STEP.s4 },
  headline: { maxWidth: 300 },
  lede: { marginTop: STEP.s2 + 2, maxWidth: 306 },
  rows: { gap: STEP.s1, marginTop: STEP.s4 - 6 },
  section: { marginTop: STEP.s4 - 8 },
  card: { flexDirection: "row", gap: STEP.s4 - 8, marginTop: STEP.s2 + 2, padding: STEP.s3, borderRadius: SHAPE.sheet, borderWidth: 1 },
  statLabel: { marginTop: STEP.s1 / 2 },
  note: { marginTop: STEP.s4 - 8, paddingVertical: STEP.s3 - 2, paddingHorizontal: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1 },
  actions: { marginTop: STEP.s4 - 8, gap: STEP.s1 },
});
