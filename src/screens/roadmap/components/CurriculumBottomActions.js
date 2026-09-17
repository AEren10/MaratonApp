import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "../../../components/design";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function CurriculumBottomActions({ C, onOpenProgram, onAddTask }) {
  return (
    <View style={s.bottomActions}>
      <Pressable
        onPress={onOpenProgram}
        accessibilityRole="button"
        accessibilityLabel="Haftalık Programım, bu haftanın durakları ve gün şeridi"
        style={({ pressed }) => [
          s.programCard,
          {
            backgroundColor: pressed ? C.elev : C.surface,
            borderColor: pressed ? C.border : C.elev,
          },
        ]}
      >
        <View style={[s.programIconWrap, { backgroundColor: C.elev }]}>
          <Icon name="calendar" size={18} color={C.accent} />
        </View>
        <View style={s.programBody}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Haftalık Programım</Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s1 / 4 }]}>
            Bu haftanın durakları ve gün şeridi
          </Text>
        </View>
        <Icon name="chevR" size={16} color={C.text3} />
      </Pressable>

      <Pressable
        onPress={onAddTask}
        accessibilityRole="button"
        accessibilityLabel="Bu döneme durak ekle"
        style={({ pressed }) => [
          s.addBtn,
          { backgroundColor: pressed ? C.elev : C.surface, borderColor: C.elev },
        ]}
      >
        <Text style={[TYPOGRAPHY.bodyMedium, s.flex, { color: C.text2 }]}>Bu döneme durak ekle</Text>
        <Icon name="chevR" size={14} color={C.text5} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  bottomActions: { paddingTop: STEP.s4, gap: STEP.s2 },
  programCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2 + 2,
    minHeight: CONTROL.buttonPrimary + 6,
    paddingHorizontal: STEP.s3,
    paddingVertical: STEP.s2 + 2,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
  },
  programIconWrap: {
    width: STEP.s4 + 6,
    height: STEP.s4 + 6,
    borderRadius: SHAPE.iconBox,
    alignItems: "center",
    justifyContent: "center",
  },
  programBody: { flex: 1, minWidth: 0 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    minHeight: CONTROL.tapMin,
    paddingHorizontal: STEP.s3,
    paddingVertical: STEP.s2,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
  },
  flex: { flex: 1 },
});
