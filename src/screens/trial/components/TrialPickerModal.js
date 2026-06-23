import { Modal, View, Text, Pressable, FlatList } from "react-native";
import { Icon, GlassCard, Chip } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const TYPE_LABELS = {
  TYT: "TYT", AYT_SAY: "AYT SAY", AYT_EA: "AYT EA",
  AYT_SOZ: "AYT SOZ", BRANCH: "Branş", AYT: "AYT",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }) : "—";

function PickerRow({ item, onSelect, isSelected, C }) {
  const label = TYPE_LABELS[item.trialType] || item.trialType;
  return (
    <Pressable
      onPress={() => onSelect(item)}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: isSelected ? C.accent + "14" : "transparent",
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.text }}>{fmtDate(item.date)}</Text>
        {item.name ? (
          <Text style={{ ...TYPOGRAPHY.micro, color: C.sec, marginTop: 2 }}>{item.name}</Text>
        ) : null}
      </View>
      <Chip color={C.accent} style={{ marginRight: SPACING.sm }}>
        {label}
      </Chip>
      <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: C.text, minWidth: 36, textAlign: "right" }}>
        {(item.totalNet ?? 0).toFixed(1)}
      </Text>
      {isSelected && (
        <Icon name="check" size={14} color={C.accent} style={{ marginLeft: SPACING.sm }} />
      )}
    </Pressable>
  );
}

export function TrialPickerModal({ visible, trials, selectedId, onSelect, onClose }) {
  const C = useC();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <Pressable onPress={() => {}}>
          <GlassCard radius={0} style={{ borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: SPACING.xl,
                paddingTop: SPACING.xl,
                paddingBottom: SPACING.md,
              }}
            >
              <Text style={{ ...TYPOGRAPHY.subheading, color: C.text, flex: 1 }}>Deneme Seç</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Icon name="x" size={20} color={C.sec} />
              </Pressable>
            </View>
            <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: SPACING.xl }} />
            <FlatList
              data={trials}
              keyExtractor={(t) => t.id ?? t.date}
              renderItem={({ item }) => (
                <PickerRow
                  item={item}
                  onSelect={(t) => { onSelect(t); onClose(); }}
                  isSelected={item.id === selectedId}
                  C={C}
                />
              )}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: SPACING.lg }} />
              )}
              style={{ maxHeight: 340 }}
              showsVerticalScrollIndicator={false}
            />
            <View style={{ height: SPACING.xxl }} />
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
