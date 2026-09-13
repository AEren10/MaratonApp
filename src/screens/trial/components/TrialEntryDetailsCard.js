import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { TrialEntryDatePicker } from "./TrialEntryDatePicker";

const HIT = { top: 3, bottom: 3 };

// DENEME ADI + TARIH (Deneme Gir 3/3). Tasarimdaki SURE satiri icin veri alani
// yok (trials tablosunda sure kolonu yok); satir gosterilmiyor.
export function TrialEntryDetailsCard({ form, styles: shared }) {
  const C = useC();
  const well = [styles.well, { backgroundColor: C.void, borderColor: C.border }];
  const dateLabel = form.trialDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  return (
    <View style={shared.panel}>
      <View style={styles.row}>
        <Text style={[shared.label, styles.key]}>DENEME ADI</Text>
        <TextInput accessibilityLabel="Deneme adı" value={form.title} onChangeText={form.handleTitleChange}
          placeholder="Deneme adı" placeholderTextColor={C.text3} maxLength={40}
          style={[TYPOGRAPHY.tableName, well, styles.input, { color: C.text }]} />
      </View>
      <View style={[styles.divider, { backgroundColor: C.line }]} />
      <View style={styles.row}>
        <Text style={[shared.label, styles.key]}>TARİH</Text>
        <Pressable onPress={() => form.setShowDatePicker((open) => !open)} hitSlop={HIT} style={well}
          accessibilityRole="button" accessibilityLabel={`Tarih: ${dateLabel}`}
          accessibilityState={{ expanded: form.showDatePicker }}>
          <Text style={[TYPOGRAPHY.tableName, { color: C.text }]}>{dateLabel}</Text>
        </Pressable>
      </View>
      {form.showDatePicker ? (
        <TrialEntryDatePicker recentDays={form.recentDays} trialDate={form.trialDate}
          onChangeDate={form.handleDateChange} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2 },
  key: { flex: 1 },
  well: {
    height: 38, paddingHorizontal: STEP.s2 + 2, borderRadius: SHAPE.button, borderWidth: 1, justifyContent: "center",
  },
  input: { minWidth: 140, maxWidth: 190, paddingVertical: 0 },
  divider: { height: 1, marginVertical: STEP.s2 + 4 },
});
