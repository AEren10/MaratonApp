import { StyleSheet, Text, View } from "react-native";
import { Icon } from "../../../components/design";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

export function CalendarHeader({ C, isPastMonth, onBack, onWeekTab }) {
  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <Press haptic="none"
          accessibilityRole="button"
          accessibilityLabel="Geri"
          hitSlop={STEP.s1}
          onPress={onBack}
          style={s.backTap}
        >
          <Icon name="chevL" size={17} color={C.text} />
        </Press>
        <Text style={[TYPOGRAPHY.subheading, s.title, { color: C.text }]}>Programım</Text>
        {isPastMonth ? (
          <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>geçmiş ay</Text>
        ) : null}
      </View>

      <View style={[s.segWrap, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <Press haptic="none"
          accessibilityRole="tab"
          accessibilityLabel="Haftalık görünüm"
          onPress={onWeekTab}
          style={s.segTab}
        >
          <Text style={[TYPOGRAPHY.captionBold, { color: C.text3 }]}>Haftalık</Text>
        </Press>
        <View style={[s.segActive, { backgroundColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.captionBold, { color: C.text }]}>Aylık</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingTop: STEP.s1 / 2 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  backTap: { width: 40, height: CONTROL.tapMin, justifyContent: "center" },
  title: { flex: 1 },
  segWrap: {
    flexDirection: "row",
    gap: STEP.s1 / 2,
    padding: STEP.s1 / 2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    marginTop: STEP.s3,
  },
  segTab: { flex: 1, height: CONTROL.segment, alignItems: "center", justifyContent: "center", borderRadius: SHAPE.chip },
  segActive: { flex: 1, height: CONTROL.segment, alignItems: "center", justifyContent: "center", borderRadius: SHAPE.chip },
});
