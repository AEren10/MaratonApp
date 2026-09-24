import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";

import { Button } from "../../../../components/design";
import { useC, useSubjectIdentity } from "../../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../../themes/subjects";
import { clockLabel, withLocative } from "../../../../domain/study/studyHistoryModel";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { RecordNumberField } from "./RecordNumberField";
import { RecordRow } from "./RecordRow";

// "Oturum Kurtarıldı": uygulama kapandıktan sonra süre onayı + düzeltme.
export function RecoveredSessionView({ session, onConfirm, onDiscard }) {
  const C = useC();
  const measured = Math.max(1, Math.floor((session.recoveredElapsed || 0) / 60));
  const [minutes, setMinutes] = useState(String(measured));
  const sid = useSubjectIdentity(session.subjectKey);
  const subjectLabel = session.subjectKey ? getSubjectByKey(session.subjectKey)?.label || session.subjectKey : null;
  const start = session.sessionStartedAt ? clockLabel(session.sessionStartedAt) : null;
  const end = clockLabel(session.startedAt ? Date.now() : session.savedAt);
  const title = [subjectLabel, session.topic].filter(Boolean).join(" · ");
  const valid = Number(minutes) >= 1 && Number(minutes) <= 720;

  return (
    <SafeAreaView edges={["top"]} style={[styles.fill, { backgroundColor: C.bg }]}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View>
            <Text style={[TYPOGRAPHY.label, styles.eyebrow, { color: C.accentBright }]}>SAYAÇ KAPANMIŞ</Text>
            <Text accessibilityRole="header" style={[TYPOGRAPHY.heading, styles.title, { color: C.text }]}>
              {`Süreni kurtardık. ${measured} dakika çalışmışsın.`}
            </Text>
            <Text style={[TYPOGRAPHY.body, styles.body, { color: C.text2 }]}>
              {start
                ? `Uygulama arka planda kapanmış ama oturum ${withLocative(start)} başlamıştı. Doğruysa onayla, değilse süreyi düzelt.`
                : "Doğruysa onayla, değilse süreyi düzelt."}
            </Text>
          </Animated.View>

          <Animated.View
            style={[styles.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
            {title || start ? (
              <>
                <View style={styles.head}>
                  {subjectLabel ? <View style={[styles.dot, { backgroundColor: sid?.solid || C.accent }]} /> : null}
                  <View style={styles.fill}>
                    {title ? <Text numberOfLines={1} style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{title}</Text> : null}
                    {start ? <Text style={[TYPOGRAPHY.meta, styles.range, { color: C.text3 }]}>{`${start} – ${end}`}</Text> : null}
                  </View>
                </View>
                <View style={[styles.line, { backgroundColor: C.line }]} />
              </>
            ) : null}
            <RecordRow label="SÜRE">
              <RecordNumberField value={minutes} onChange={setMinutes} suffix="dk" width={88} a11yLabel="Süre, dakika" />
            </RecordRow>
          </Animated.View>

          <Animated.View style={styles.actions}>
            <Button size="lg" fullWidth disabled={!valid} onPress={() => onConfirm(Number(minutes))}>
              Onayla, durağa işle
            </Button>
            <Button variant="outline" size="lg" fullWidth onPress={onDiscard}>Bu oturumu sil</Button>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 + 4, paddingBottom: STEP.s4 + 6 },
  eyebrow: { letterSpacing: 2.76 },
  title: { marginTop: STEP.s2 + 2, maxWidth: 300 },
  body: { marginTop: STEP.s2 + 2, maxWidth: 300 },
  card: { marginTop: STEP.s3 + 6, padding: STEP.s3 + 2, borderRadius: SHAPE.sheet + 2, borderWidth: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  dot: { width: 8, height: 8, borderRadius: SHAPE.chip / 6 },
  range: { marginTop: STEP.s1 / 2 },
  line: { height: 1, marginVertical: STEP.s2 + 2 },
  actions: { marginTop: STEP.s3 + 6, gap: STEP.s2 },
});
