import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon, Button, Card } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { ReorganizeTaskRow } from "./ReorganizeTaskRow";
import { ReorganizeScheduleCard, ReorganizeClearButton } from "./ReorganizeActions";
import { Press } from "../../../components/design/Press";

export function ReorganizeDayModal({
  visible,
  onClose,
  dayLabel,
  tasks = [],
  onMoveTask,
  onRemoveTask,
  onClearRemaining,
  onOpenSchedule,
  C,
}) {
  const incompleteTasks = tasks.filter((t) => !t.done);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[s.overlay, { backgroundColor: C.void + "CC" }]}>
        <SafeAreaView edges={["bottom"]} style={[s.sheet, { backgroundColor: C.bg, borderColor: C.line }]}>
          <View style={[s.header, { borderBottomColor: C.line }]}>
            <View style={s.headerTextWrap}>
              <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Günü Yeniden Düzenle</Text>
              {dayLabel ? <Text style={[TYPOGRAPHY.meta, { color: C.accent }]}>{dayLabel}</Text> : null}
            </View>
            <Press haptic="none" onPress={onClose} hitSlop={STEP.s2}>
              <Icon name="x" size={20} color={C.text2} />
            </Press>
          </View>

          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            <ReorganizeScheduleCard
              onPress={() => {
                H.select();
                onClose();
                onOpenSchedule();
              }}
              C={C}
            />

            <View style={s.sectionHeader}>
              <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>DURAK SIRASI VE YÖNETİMİ</Text>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>
                {incompleteTasks.length} aktif durak
              </Text>
            </View>

            {tasks.length === 0 ? (
              <Card tone="void" radius="panel" style={s.emptyCard}>
                <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text3 }]}>Bu gün için durak bulunmuyor.</Text>
              </Card>
            ) : (
              <View style={s.tasksList}>
                {tasks.map((t, idx) => (
                  <ReorganizeTaskRow
                    key={t.id}
                    task={t}
                    idx={idx}
                    isDone={t.done}
                    canMoveUp={!t.done && idx > 0 && !tasks[idx - 1]?.done}
                    canMoveDown={!t.done && idx < tasks.length - 1 && !tasks[idx + 1]?.done}
                    onMoveUp={() => onMoveTask(t.id, "up")}
                    onMoveDown={() => onMoveTask(t.id, "down")}
                    onRemove={() => onRemoveTask(t.id)}
                    C={C}
                  />
                ))}
              </View>
            )}

            {incompleteTasks.length > 0 ? (
              <ReorganizeClearButton
                onPress={() => {
                  H.warn();
                  onClearRemaining();
                }}
                C={C}
              />
            ) : null}
          </ScrollView>

          <View style={[s.footer, { borderTopColor: C.line }]}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => {
                H.success();
                onClose();
              }}
            >
              Tamam
            </Button>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: { height: "82%", borderTopLeftRadius: SHAPE.sheet, borderTopRightRadius: SHAPE.sheet, borderTopWidth: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s3, borderBottomWidth: 1 },
  headerTextWrap: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s5 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: STEP.s4, marginBottom: STEP.s2 },
  emptyCard: { padding: STEP.s4, alignItems: "center", borderWidth: 1 },
  tasksList: { gap: STEP.s2 },
  footer: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s4, borderTopWidth: 1 },
});
