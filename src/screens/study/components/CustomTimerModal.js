import React, { useState, useEffect } from "react";
import { Modal, View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../../../components/design/Icon";
import { Press } from "../../../components/design/Press";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../themes/tokens";
import { CustomTimerSection } from "./customTimer/CustomTimerSection";
import { CustomTimerPreview } from "./customTimer/CustomTimerPreview";

const FOCUS_PRESETS = [15, 20, 25, 30, 45, 60];
const BREAK_PRESETS = [3, 5, 10, 15, 20];
const CYCLE_PRESETS = [1, 2, 3, 4, 6];

export function CustomTimerModal({
  visible,
  onClose,
  onApply,
  initialConfig,
  C,
}) {
  const insets = useSafeAreaInsets();
  const [focus, setFocus] = useState(initialConfig?.focus || 25);
  const [breakMin, setBreakMin] = useState(initialConfig?.break || 5);
  const [cycles, setCycles] = useState(initialConfig?.cycles || 4);

  useEffect(() => {
    if (visible && initialConfig) {
      setFocus(initialConfig.focus || 25);
      setBreakMin(initialConfig.break || 5);
      setCycles(initialConfig.cycles || 4);
    }
  }, [visible, initialConfig]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[s.overlay, { backgroundColor: C.void + "D9" }]}>
        <View style={[s.sheet, { backgroundColor: C.bg, borderColor: C.line, paddingBottom: insets.bottom + STEP.s3 }]}>
          <View style={[s.handle, { backgroundColor: C.border }]} />

          <View style={s.header}>
            <View style={s.headerTextWrap}>
              <Text style={[TYPOGRAPHY.label, { color: C.accentBright || C.accent }]}>ÖZEL ODAK AYARI</Text>
              <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>Süre ve Mola</Text>
            </View>
            <Press haptic="none" scaleTo={0.92} onPress={onClose} hitSlop={STEP.s2}>
              <Icon name="x" size={20} color={C.text2} />
            </Press>
          </View>

          <ScrollView style={s.body} contentContainerStyle={s.bodyContent} showsVerticalScrollIndicator={false}>
            <CustomTimerSection
              label="ODAK SÜRESİ"
              value={focus}
              unit="dk odak"
              min={5}
              max={120}
              step={5}
              presets={FOCUS_PRESETS}
              onChange={setFocus}
              C={C}
            />

            <CustomTimerSection
              label="MOLA SÜRESİ"
              value={breakMin}
              unit="dk mola"
              min={1}
              max={30}
              step={1}
              presets={BREAK_PRESETS}
              onChange={setBreakMin}
              C={C}
            />

            <CustomTimerSection
              label="DÖNGÜ SAYISI"
              value={cycles}
              unit="seans"
              min={1}
              max={8}
              step={1}
              presets={CYCLE_PRESETS}
              onChange={setCycles}
              C={C}
            />

            <CustomTimerPreview
              focus={focus}
              breakMin={breakMin}
              cycles={cycles}
              onApply={() => onApply({ focus, break: breakMin, cycles })}
              C={C}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: SHAPE.sheet,
    borderTopRightRadius: SHAPE.sheet,
    borderWidth: 1,
    maxHeight: "88%",
  },
  handle: {
    width: STEP.s4,
    height: STEP.s1 / 2,
    borderRadius: SHAPE.chip,
    alignSelf: "center",
    marginTop: STEP.s1,
    marginBottom: STEP.s1 / 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s1,
    paddingBottom: STEP.s2,
  },
  headerTextWrap: { flex: 1 },
  body: { paddingHorizontal: GUTTER },
  bodyContent: { paddingBottom: STEP.s4 },
});
