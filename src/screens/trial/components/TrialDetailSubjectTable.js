import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { SectionLabel } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

function Col({ children, C, width, align = "center" }) {
  return (
    <Text style={[TYPOGRAPHY.label, { color: C.text3, width, textAlign: align, letterSpacing: 0 }]}>
      {children}
    </Text>
  );
}

function SubjectRow({ b, C, isLast }) {
  return (
    <View style={[styles.row, { borderTopColor: C.line }, isLast && { borderBottomWidth: 1, borderBottomColor: C.line }]}>
      <View style={[styles.dot, { backgroundColor: b.c }]} />
      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]} numberOfLines={1}>{b.name}</Text>
      <Text style={[TYPOGRAPHY.caption, { color: C.text, width: 30, textAlign: "center" }]}>{b.correct}</Text>
      <Text style={[TYPOGRAPHY.caption, { color: C.text3, width: 26, textAlign: "center" }]}>{b.wrong}</Text>
      <Text style={[TYPOGRAPHY.caption, { color: C.text3, width: 26, textAlign: "center" }]}>{b.empty}</Text>
      <Text style={[TYPOGRAPHY.statMedium, { color: C.text, width: 44, textAlign: "right", fontSize: 18, lineHeight: 22 }]}>
        {b.net.toFixed(2).replace(/\.00$/, "").replace(".", ",")}
      </Text>
    </View>
  );
}

export function TrialDetailSubjectTable({ C, bars }) {
  if (!bars.length) return null;
  return (
    <Animated.View entering={FadeInDown.delay(140).duration(420)} style={styles.wrap}>
      <View style={styles.headerRow}>
        <SectionLabel style={{ marginBottom: 0, flex: 1 }}>DERS DERS</SectionLabel>
        <Col C={C} width={30}>D</Col>
        <Col C={C} width={26}>Y</Col>
        <Col C={C} width={26}>B</Col>
        <Col C={C} width={44} align="right">NET</Col>
      </View>
      <View style={{ marginTop: STEP.s1 }}>
        {bars.map((b, i) => (
          <SubjectRow key={b.key} b={b} C={C} isLast={i === bars.length - 1} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: STEP.s3, marginTop: STEP.s4 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s1,
    paddingVertical: STEP.s1 + 6, borderTopWidth: 1, borderTopColor: "transparent",
  },
  dot: { width: 8, height: 8, borderRadius: 1, marginRight: 4 },
});
