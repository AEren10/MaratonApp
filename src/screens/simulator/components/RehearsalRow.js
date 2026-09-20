import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";

// Prova formunun satiri: etiket · deger · ok. Dokununca satirin altinda
// secenekler (cip) ya da yazma alani acilir; ayri bir sayfa acilmaz.
export function RehearsalRow({ label, value, open, onToggle, last, children }) {
  const C = useC();
  return (
    <View style={!last && { borderBottomWidth: 1, borderBottomColor: C.line }}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${label}: ${value || ""}`}
        style={s.row}
      >
        <Text style={[TYPOGRAPHY.bodyMedium, s.label, { color: C.text }]}>{label}</Text>
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]} numberOfLines={1}>{value}</Text>
        <Icon name={open ? "chevDown" : "chevR"} size={12} color={C.text5} />
      </Pressable>
      {open ? <View style={s.panel}>{children}</View> : null}
    </View>
  );
}

export function RehearsalOptions({ options, selected, onSelect }) {
  const C = useC();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
      {options.map((o) => {
        const on = o.value === selected;
        return (
          <Pressable
            key={o.value}
            onPress={() => onSelect(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[s.chip, on ? { backgroundColor: C.brandTint, borderColor: C.accent } : { borderColor: C.border }]}
          >
            <Text style={[TYPOGRAPHY.captionMedium, { color: on ? C.text : C.text2 }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function RehearsalInput({ value, onChange, label, time }) {
  const C = useC();
  return (
    <TextInput
      autoFocus
      value={value}
      onChangeText={onChange}
      accessibilityLabel={label}
      keyboardType={time ? "number-pad" : "default"}
      maxLength={time ? 5 : 40}
      placeholder={time ? "--:--" : "—"}
      placeholderTextColor={C.text3}
      returnKeyType="done"
      style={[
        time ? [TYPOGRAPHY.inputTopic, s.time] : [TYPOGRAPHY.inputTable, s.text],
        { color: C.text, backgroundColor: C.void, borderColor: C.border },
      ]}
    />
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2, height: 58 },
  label: { flex: 1 },
  panel: { paddingBottom: STEP.s2 },
  chips: { gap: STEP.s1 },
  chip: {
    height: CONTROL.chip, paddingHorizontal: STEP.s2 + 2, borderRadius: SHAPE.chip, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  time: {
    width: 88, height: CONTROL.chip, borderRadius: SHAPE.button, borderWidth: 1,
    textAlign: "center", fontVariant: ["tabular-nums"], paddingVertical: 0,
  },
  text: {
    height: CONTROL.chip, borderRadius: SHAPE.button, borderWidth: 1,
    paddingHorizontal: STEP.s2, paddingVertical: 0,
  },
});
