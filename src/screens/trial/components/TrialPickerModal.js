import { Modal, View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const TYPE_LABELS = {
  TYT: "TYT", AYT_SAY: "AYT SAY", AYT_EA: "AYT EA",
  AYT_SOZ: "AYT SOZ", BRANCH: "BRANŞ", AYT: "AYT", LGS: "LGS",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }) : "—";

function PickerRow({ item, onSelect, isSelected, C }) {
  // Deneme turu bir ders degil -- rozet notr text3 ile ciziliyor.
  const label = TYPE_LABELS[item.trialType] || item.trialType;
  return (
    <Pressable
      onPress={() => onSelect(item)}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${item.title || label}, ${fmtDate(item.date)}`}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: isSelected ? C.brandTint : "transparent", opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]} numberOfLines={1}>
          {item.title?.trim() || fmtDate(item.date)}
        </Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 2 }]}>
          {label} · {fmtDate(item.date)}
        </Text>
      </View>
      <Text style={[TYPOGRAPHY.statMedium, styles.net, { color: C.text }]} allowFontScaling={false}>
        {Number(item.totalNet ?? 0).toFixed(1).replace(".", ",")}
      </Text>
      {isSelected && <Icon name="check" size={14} color={C.accent} style={{ marginLeft: STEP.s1 }} />}
    </Pressable>
  );
}

export function TrialPickerModal({ visible, trials, selectedId, onSelect, onClose }) {
  const C = useC();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Kapat">
        <Pressable onPress={() => {}} style={[styles.sheet, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.head}>
            <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Deneme seç</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Kapat">
              <Icon name="x" size={18} color={C.text2} />
            </Pressable>
          </View>

          <FlatList
            data={trials}
            keyExtractor={(t) => String(t.id ?? t.date)}
            renderItem={({ item }) => (
              <PickerRow
                item={item}
                onSelect={(t) => { onSelect(t); onClose(); }}
                isSelected={item.id === selectedId}
                C={C}
              />
            )}
            ItemSeparatorComponent={() => (
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.line, marginHorizontal: GUTTER }} />
            )}
            style={{ maxHeight: 340 }}
            showsVerticalScrollIndicator={false}
          />
          <View style={{ height: STEP.s4 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: SHAPE.sheet, borderTopRightRadius: SHAPE.sheet, borderWidth: 1, borderBottomWidth: 0 },
  head: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s3,
    paddingBottom: STEP.s2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
    minHeight: CONTROL.tapMin,
  },
  net: { fontSize: 18, minWidth: 44, textAlign: "right" },
});
