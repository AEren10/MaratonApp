import { StyleSheet, Text, TextInput, View, Switch } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { TrialEntryDatePicker } from "./TrialEntryDatePicker";
import { Press } from "../../../components/design/Press";

const HIT = { top: 3, bottom: 3 };

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
          style={[TYPOGRAPHY.inputTable, well, styles.input, { color: C.text }]} />
      </View>
      <View style={[styles.divider, { backgroundColor: C.line }]} />
      <View style={styles.row}>
        <Text style={[shared.label, styles.key]}>TARİH</Text>
        <Press haptic="none" onPress={() => form.setShowDatePicker((open) => !open)} hitSlop={HIT} style={well}
          accessibilityRole="button" accessibilityLabel={`Tarih: ${dateLabel}`}
          accessibilityState={{ expanded: form.showDatePicker }}>
          <Text style={[TYPOGRAPHY.tableName, { color: C.text }]}>{dateLabel}</Text>
        </Press>
      </View>
      {form.showDatePicker ? (
        <TrialEntryDatePicker recentDays={form.recentDays} trialDate={form.trialDate}
          onChangeDate={form.handleDateChange} />
      ) : null}
      <View style={[styles.divider, { backgroundColor: C.line }]} />
      <View style={styles.row}>
        <Text style={[shared.label, styles.key]}>SÜRE</Text>
        <View style={well}>
          <Text style={[TYPOGRAPHY.tableName, { color: C.text }]}>135 dk</Text>
        </View>
      </View>
    </View>
  );
}

export function TrialEntryNotebookToggle({ value, onValueChange, count }) {
  const C = useC();
  return (
    <View style={[styles.panel, { backgroundColor: C.surface, borderColor: C.elev }]}>
      <View style={{ flex: 1 }}>
        <Text style={[TYPOGRAPHY.tableName, { color: C.text }]}>Yanlışları deftere ekle</Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 4 }]}>{count} yanlış · tekrar takvimine düşer</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: C.track, true: C.accent }} 
        thumbColor={C.text} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexDirection: "row", alignItems: "center", padding: STEP.s3,
    borderRadius: SHAPE.panel, borderWidth: 1,
  },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2 },
  key: { flex: 1 },
  well: {
    height: 38, paddingHorizontal: STEP.s2 + 2, borderRadius: SHAPE.button, borderWidth: 1, justifyContent: "center",
  },
  input: { minWidth: 140, maxWidth: 190, paddingVertical: 0 },
  divider: { height: 1, marginVertical: STEP.s2 + 4 },
});
