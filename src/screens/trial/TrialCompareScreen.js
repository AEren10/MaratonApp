import { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";

import { Icon, Chip, GlassCard } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { selectTrials } from "../../store/slices/trialSlice";
import { getTrialTypes, getAllSubjects } from "./trialTypes";
import { TrialPickerModal } from "./components/TrialPickerModal";
import { MotivationCard } from "./components/MotivationCard";
import { SCREENS } from "../../constants/screens";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) : "—";

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
  const route = useRoute();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const trials = useSelector(selectTrials);

  const sorted = useMemo(() => [...trials].sort((a, b) => new Date(b.date) - new Date(a.date)), [trials]);
  const trialTypes = useMemo(() => getTrialTypes(C), [C]);
  const allSubjects = useMemo(() => getAllSubjects(C), [C]);

  const defaultNewer = sorted[0];
  const defaultOlder = sorted.find((t, i) => i > 0 && t.trialType === defaultNewer?.trialType) || sorted[1] || sorted[0];

  const [newer, setNewer] = useState(() => route.params?.trial1Id ? sorted.find(t => t.id === route.params.trial1Id) ?? defaultNewer : defaultNewer);
  const [older, setOlder] = useState(() => route.params?.trial2Id ? sorted.find(t => t.id === route.params.trial2Id) ?? defaultOlder : defaultOlder);
  const [pickerTarget, setPickerTarget] = useState(null); // "newer" | "older"

  const sameTypeTrials = useMemo(() =>
    sorted.filter(t => t.trialType === (newer?.trialType ?? sorted[0]?.trialType)),
    [sorted, newer]
  );

  const typeMeta = trialTypes[newer?.trialType];
  const subjects = typeMeta?.subjects ||
    (newer?.trialType === "BRANCH" && newer?.branchSubject
      ? allSubjects.filter((s) => s.key === newer.branchSubject) : []);

  const newerNet = newer?.totalNet || 0;
  const olderNet = older?.totalNet || 0;
  const diff = newerNet - olderNet;

  const subjectPairs = subjects.map((s) => ({
    key: s.key, name: s.name, c: s.color,
    v1: older?.subjects?.[s.key]?.net || 0,
    v2: newer?.subjects?.[s.key]?.net || 0,
    max: s.max,
  }));

  if (!newer) return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12}><Icon name="arrowL" size={22} color={C.text} /></Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>Karsilastirma</Text>
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Icon name="chart" size={40} color={C.muted} />
        <Text style={[TYPOGRAPHY.body, { color: C.muted, marginTop: SPACING.md }]}>Karşılaştırma için en az 2 deneme gerekli</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12}><Icon name="arrowL" size={22} color={C.text} /></Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>Karsilastirma</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(420).springify()} style={styles.dateCards}>
          <Pressable onPress={() => setPickerTarget("older")} style={{ flex: 1 }}>
            <View style={[styles.dateCard, { opacity: 0.7, borderColor: C.border, borderWidth: 1 }]}>
              <Icon name="calendar" size={14} color={C.muted} />
              <Text style={[TYPOGRAPHY.captionMedium, { color: C.sec }]}>{fmtDate(older?.date)}</Text>
              <Text style={[TYPOGRAPHY.statSmall, { color: C.muted }]}>{olderNet}</Text>
              <Chip color={C.muted}>değiştir</Chip>
            </View>
          </Pressable>
          <Icon name="arrowR" size={20} color={C.accent} />
          <Pressable onPress={() => setPickerTarget("newer")} style={{ flex: 1 }}>
            <View style={[styles.dateCard, { borderColor: C.accent + "40", borderWidth: 1 }]}>
              <Icon name="calendar" size={14} color={C.accent} />
              <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>{fmtDate(newer?.date)}</Text>
              <Text style={[TYPOGRAPHY.statSmall, { color: C.accent }]}>{newerNet}</Text>
              <Chip color={C.accent}>değiştir</Chip>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(170).duration(420).springify()} style={styles.totalDiff}>
          <Text style={[TYPOGRAPHY.caption, { color: C.sec }]}>Toplam degisim</Text>
          <View style={styles.totalRow}>
            <Text style={[TYPOGRAPHY.stat, { color: diff >= 0 ? C.green : C.red }]}>{diff.toFixed(1)}</Text>
            <Chip color={diff >= 0 ? C.green : C.red}>{diff >= 0 ? "Artis" : "Dusus"}</Chip>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(420).springify()}>
          <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>DERS BAZLI KARSILASTIRMA</Text>
          {subjectPairs.map((s) => (
            <CompareBar key={s.key} label={s.name} v1={s.v1} v2={s.v2} max={s.max} color={s.c} styles={styles} C={C} />
          ))}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { opacity: 0.4 }]} />
              <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>{fmtDate(older?.date)}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendDot} />
              <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>{fmtDate(newer?.date)}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(310).duration(420).springify()} style={{ marginTop: SPACING.xxl }}>
          <MotivationCard diff={diff} C={C} onNavigate={() => navigation.navigate(SCREENS.ANALYSIS)} />
        </Animated.View>
      </ScrollView>

      <TrialPickerModal
        visible={pickerTarget !== null}
        trials={sameTypeTrials}
        selectedId={pickerTarget === "newer" ? newer?.id : older?.id}
        onSelect={(t) => pickerTarget === "newer" ? setNewer(t) : setOlder(t)}
        onClose={() => setPickerTarget(null)}
      />
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },
    dateCards: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.md, marginBottom: SPACING.xxl },
    dateCard: { alignItems: "center", gap: SPACING.xs, backgroundColor: C.surface, borderRadius: RADIUS.xl, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
    totalDiff: { alignItems: "center", backgroundColor: C.surface, borderRadius: RADIUS.xxl, padding: SPACING.xxl, marginBottom: SPACING.xxl },
    totalRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, marginTop: SPACING.sm },
    compareRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingVertical: SPACING.lg, borderBottomWidth: 1, borderBottomColor: C.border },
    barBg: { height: 6, borderRadius: 3, backgroundColor: C.surface2, overflow: "hidden" },
    barFill: { height: 6, borderRadius: 3 },
    diffBadge: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2, minWidth: 40, alignItems: "center" },
    legendRow: { flexDirection: "row", justifyContent: "center", gap: SPACING.xl, marginTop: SPACING.xl },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent },
  });
}
