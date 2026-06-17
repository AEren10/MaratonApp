import { useCallback, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useSelector } from "react-redux";
import { Icon, Chip } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { selectTrials } from "../../store/slices/trialSlice";
import { getTrialTypes, getAllSubjects } from "./trialTypes";

function CompareBar({ label, v1, v2, max, color, styles, C }) {
  const p1 = max > 0 ? (v1 / max) * 100 : 0;
  const p2 = max > 0 ? (v2 / max) * 100 : 0;
  const diff = v2 - v1;
  const diffColor = diff > 0 ? C.green : diff < 0 ? C.red : C.muted;
  return (
    <View style={styles.compareRow}>
      <Text style={[TYPOGRAPHY.captionMedium, { color, width: 70 }]}>{label}</Text>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${p1}%`, backgroundColor: color, opacity: 0.4 }]} />
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${p2}%`, backgroundColor: color }]} />
        </View>
      </View>
      <View style={{ alignItems: "flex-end", minWidth: 50 }}>
        <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>{v1}</Text>
        <Text style={[TYPOGRAPHY.captionMedium, { color }]}>{v2}</Text>
      </View>
      <View style={[styles.diffBadge, { backgroundColor: diffColor + "20" }]}>
        <Text style={[TYPOGRAPHY.micro, { color: diffColor }]}>
          {diff > 0 ? "+" : ""}{diff.toFixed(1)}
        </Text>
      </View>
    </View>
  );
}

export default function TrialCompareScreen() {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const trials = useSelector(selectTrials);

  const sorted = [...trials].sort((a, b) => new Date(b.date) - new Date(a.date));
  // Pair same-type trials for fair comparison
  const newer = sorted[0];
  const older = sorted.find((t, i) => i > 0 && t.trialType === newer?.trialType) || sorted[1] || sorted[0];

  const trialTypes = useMemo(() => getTrialTypes(C), [C]);
  const allSubjects = useMemo(() => getAllSubjects(C), [C]);
  const typeMeta = trialTypes[newer?.trialType];
  const subjects = typeMeta?.subjects ||
    (newer?.trialType === "BRANCH" && newer?.branchSubject
      ? allSubjects.filter((s) => s.key === newer.branchSubject)
      : []);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) : "—";
  const newerDate = fmtDate(newer?.date);
  const olderDate = fmtDate(older?.date);
  const newerNet = newer?.totalNet || 0;
  const olderNet = older?.totalNet || 0;
  const diff = newerNet - olderNet;

  const subjectPairs = subjects.map((s) => ({
    key: s.key,
    name: s.name,
    c: s.color,
    v1: older?.subjects?.[s.key]?.net || 0,
    v2: newer?.subjects?.[s.key]?.net || 0,
    max: s.max,
  }));

  if (!newer) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={12}>
            <Icon name="arrowL" size={22} color={C.text} />
          </Pressable>
          <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>
            Karsilastirma
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Icon name="chart" size={40} color={C.muted} />
          <Text style={[TYPOGRAPHY.body, { color: C.muted, marginTop: SPACING.md }]}>
            Karşılaştırma için en az 2 deneme gerekli
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>
          Karsilastirma
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(420).springify()} style={styles.dateCards}>
          <View style={[styles.dateCard, { opacity: 0.6 }]}>
            <Icon name="calendar" size={14} color={C.muted} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.sec }]}>{olderDate}</Text>
            <Text style={[TYPOGRAPHY.statSmall, { color: C.muted }]}>{olderNet}</Text>
          </View>
          <Icon name="arrowR" size={20} color={C.amber} />
          <View style={styles.dateCard}>
            <Icon name="calendar" size={14} color={C.amber} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>{newerDate}</Text>
            <Text style={[TYPOGRAPHY.statSmall, { color: C.amber }]}>{newerNet}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(170).duration(420).springify()} style={styles.totalDiff}>
          <Text style={[TYPOGRAPHY.caption, { color: C.sec }]}>Toplam degisim</Text>
          <View style={styles.totalRow}>
            <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>
              {diff.toFixed(1)}
            </Text>
            <Chip color={diff >= 0 ? C.green : C.red}>
              {diff >= 0 ? "Artis" : "Dusus"}
            </Chip>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(420).springify()}>
          <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>
            DERS BAZLI KARSILASTIRMA
          </Text>

          {subjectPairs.map((s) => (
            <CompareBar
              key={s.key}
              label={s.name}
              v1={s.v1}
              v2={s.v2}
              max={s.max}
              color={s.c}
              styles={styles}
              C={C}
            />
          ))}

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { opacity: 0.4 }]} />
              <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>{olderDate}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendDot} />
              <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>{newerDate}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },
    dateCards: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: SPACING.md, marginBottom: SPACING.xxl,
    },
    dateCard: {
      alignItems: "center", gap: SPACING.xs,
      backgroundColor: C.surface, borderRadius: RADIUS.xl,
      paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg,
      flex: 1,
    },
    totalDiff: {
      alignItems: "center", backgroundColor: C.surface,
      borderRadius: RADIUS.xxl, padding: SPACING.xxl, marginBottom: SPACING.xxl,
    },
    totalRow: {
      flexDirection: "row", alignItems: "center", gap: SPACING.md, marginTop: SPACING.sm,
    },
    compareRow: {
      flexDirection: "row", alignItems: "center", gap: SPACING.sm,
      paddingVertical: SPACING.lg, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    barBg: {
      height: 6, borderRadius: 3, backgroundColor: C.surface2, overflow: "hidden",
    },
    barFill: { height: 6, borderRadius: 3 },
    diffBadge: {
      borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2,
      minWidth: 40, alignItems: "center",
    },
    legendRow: {
      flexDirection: "row", justifyContent: "center", gap: SPACING.xl,
      marginTop: SPACING.xl,
    },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendDot: {
      width: 8, height: 8, borderRadius: 4, backgroundColor: C.amber,
    },
  });
}
