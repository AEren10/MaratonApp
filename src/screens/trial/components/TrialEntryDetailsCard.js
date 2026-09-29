import { StyleSheet, Text, TextInput, View } from "react-native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { TrialEntryDatePicker } from "./TrialEntryDatePicker";

export function TrialEntryDetailsCard({ form, styles: shared }) {
  const C = useC();
  const dateLabel = form.trialDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });

  return (
    <View style={shared.panel}>
      {/* DENEME ADI */}
      <View style={styles.row}>
        <Text style={[TYPOGRAPHY.label, styles.label, { color: C.text2 }]}>DENEME ADI</Text>
        <TextInput
          accessibilityLabel="Deneme adı"
          value={form.title}
          onChangeText={form.handleTitleChange}
          placeholder="İsteğe bağlı"
          placeholderTextColor={C.text3}
          maxLength={40}
          style={[TYPOGRAPHY.bodyMedium, styles.titleInput, { color: C.text }]}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: C.line }]} />

      {/* TARİH */}
      <Press
        haptic="tap"
        onPress={() => form.setShowDatePicker((open) => !open)}
        accessibilityRole="button"
        accessibilityLabel={`Tarih: ${dateLabel}`}
        accessibilityState={{ expanded: form.showDatePicker }}
        style={styles.row}
      >
        <Text style={[TYPOGRAPHY.label, styles.label, { color: C.text2 }]}>TARİH</Text>
        <View style={styles.valueRow}>
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{dateLabel}</Text>
          <Icon name={form.showDatePicker ? "chevDown" : "chevR"} size={12} color={C.text5} />
        </View>
      </Press>

      {form.showDatePicker ? (
        <TrialEntryDatePicker
          recentDays={form.recentDays}
          trialDate={form.trialDate}
          onChangeDate={form.handleDateChange}
        />
      ) : null}

      <View style={[styles.divider, { backgroundColor: C.line }]} />

      {/* SÜRE */}
      <View style={styles.row}>
        <Text style={[TYPOGRAPHY.label, styles.label, { color: C.text2 }]}>SÜRE</Text>
        <View style={[styles.numberBox, { backgroundColor: C.void, borderColor: C.border }]}>
          <TextInput
            accessibilityLabel="Deneme süresi dakika"
            keyboardType="number-pad"
            value={form.durationMinutes}
            onChangeText={form.handleDurationChange}
            placeholder="0"
            placeholderTextColor={C.text3}
            maxLength={3}
            selectTextOnFocus
            style={[TYPOGRAPHY.inputStat, styles.numberInput, { color: C.text }]}
          />
          <Text style={[TYPOGRAPHY.bodyMedium, styles.suffix, { color: C.text3 }]}>dk</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: STEP.s2,
    minHeight: CONTROL.buttonPrimary,
    paddingVertical: STEP.s1 / 2,
  },
  label: {
    flex: 1,
    letterSpacing: 1.8,
  },
  titleInput: {
    minWidth: 140,
    maxWidth: "60%",
    textAlign: "right",
    paddingVertical: STEP.s1 - STEP.s1,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
  },
  numberBox: {
    height: CONTROL.buttonTertiary,
    minWidth: 80,
    borderRadius: SHAPE.chip + 2,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: STEP.s1,
  },
  numberInput: {
    paddingVertical: STEP.s1 - STEP.s1,
    textAlign: "center",
    minWidth: 36,
    fontVariant: ["tabular-nums"],
  },
  suffix: {
    marginLeft: STEP.s1 / 4,
  },
  divider: {
    height: 1,
    marginVertical: STEP.s1,
  },
});
