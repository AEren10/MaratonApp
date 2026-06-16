import { useMemo, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Svg, { Polyline, Line, Circle as SvgCircle, Defs, LinearGradient, Stop, Polygon } from "react-native-svg";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { selectTrials } from "../../store/slices/trialSlice";
import { getAllSubjects } from "./trialTypes";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = SCREEN_W - 64;
const CHART_H = 180;
const MINI_H = 100;
const PAD = { l: 36, r: 12, t: 12, b: 24 };

function buildLine(data, w, h) {
  if (data.length < 2) return { pts: [], polyStr: "", areaStr: "" };
  const vals = data.map((d) => d.net);
  const min = Math.min(...vals) - 2;
  const max = Math.max(...vals) + 2;
  const range = max - min || 1;
  const xStep = (w - PAD.l - PAD.r) / (data.length - 1);

  const pts = data.map((d, i) => ({
    x: PAD.l + i * xStep,
    y: PAD.t + (1 - (d.net - min) / range) * (h - PAD.t - PAD.b),
    net: d.net,
    date: d.date,
  }));
  const polyStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const areaStr = `${pts[0].x},${h - PAD.b} ${polyStr} ${pts[pts.length - 1].x},${h - PAD.b}`;

  return { pts, polyStr, areaStr, min, max };
}

function gridLines(min, max, h) {
  const range = max - min || 1;
  const step = Math.ceil(range / 4) || 1;
  const lines = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
    const y = PAD.t + (1 - (v - min) / range) * (h - PAD.t - PAD.b);
    lines.push({ y, label: Math.round(v) });
  }
  return lines;
}

function NetChart({ data, color, height = CHART_H, width = CHART_W, C, showLabels = true }) {
  const { pts, polyStr, areaStr, min, max } = useMemo(() => buildLine(data, width, height), [data, width, height]);
  const grids = useMemo(() => gridLines(min ?? 0, max ?? 10, height), [min, max, height]);
  const gradId = `grad_${color?.replace("#", "")}`;

  if (pts.length < 2) {
    return (
      <View style={{ height, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ ...TYPOGRAPHY.caption, color: C.muted }}>Yeterli veri yok</Text>
      </View>
    );
  }

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.25" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {showLabels && grids.map((g) => (
        <React.Fragment key={g.label}>
          <Line x1={PAD.l} y1={g.y} x2={width - PAD.r} y2={g.y} stroke={C.border} strokeWidth={0.5} strokeDasharray="4,4" />
          <SvgText x={PAD.l - 6} y={g.y + 4} textAnchor="end" fill={C.muted} fontSize={9} fontFamily="Inter_400Regular">
            {g.label}
          </SvgText>
        </React.Fragment>
      ))}

      <Polygon points={areaStr} fill={`url(#${gradId})`} />
      <Polyline points={polyStr} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <SvgCircle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={4} fill={color} />
    </Svg>
  );
}

function SvgText(props) {
  const RNSvgText = require("react-native-svg").Text;
  return <RNSvgText {...props} />;
}

function React_Fragment({ children }) { return children; }
const React = { Fragment: React_Fragment };

function ChangeBadge({ current, previous, C }) {
  if (previous == null || current == null) return null;
  const diff = current - previous;
  const pct = previous > 0 ? ((diff / previous) * 100).toFixed(1) : 0;
  const up = diff >= 0;
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: 4,
      backgroundColor: (up ? C.green : C.red) + "18",
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    }}>
      <Icon name={up ? "trendUp" : "trendDown"} size={12} color={up ? C.green : C.red} />
      <Text style={{ ...TYPOGRAPHY.captionMedium, color: up ? C.green : C.red, fontSize: 12 }}>
        {up ? "+" : ""}{diff.toFixed(1)} ({up ? "+" : ""}{pct}%)
      </Text>
    </View>
  );
}

const TYPE_FILTERS = [
  { key: "ALL", label: "Tümü" },
  { key: "TYT", label: "TYT" },
  { key: "AYT", label: "AYT" },
  { key: "BRANCH", label: "Branş" },
];

export default function TrialInsightsScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const allTrials = useSelector(selectTrials);
  const [filter, setFilter] = useState("ALL");

  const filteredTrials = useMemo(() => {
    let list = [...allTrials].reverse();
    if (filter === "TYT") list = list.filter((t) => t.trialType === "TYT");
    else if (filter === "AYT") list = list.filter((t) => t.trialType?.startsWith("AYT"));
    else if (filter === "BRANCH") list = list.filter((t) => t.trialType === "BRANCH");
    return list;
  }, [allTrials, filter]);

  const overallData = useMemo(
    () => filteredTrials.map((t) => ({ net: t.totalNet ?? 0, date: t.date })),
    [filteredTrials],
  );

  const latestNet = overallData.length > 0 ? overallData[overallData.length - 1].net : 0;
  const prevNet = overallData.length > 1 ? overallData[overallData.length - 2].net : null;

  const subjectBreakdowns = useMemo(() => {
    const subjects = getAllSubjects(C);
    const map = {};
    for (const trial of filteredTrials) {
      for (const [key, val] of Object.entries(trial.subjects || {})) {
        if (!map[key]) map[key] = [];
        map[key].push({ net: val.net ?? 0, date: trial.date });
      }
    }
    return subjects
      .filter((subj) => map[subj.key] && map[subj.key].length >= 1)
      .map((subj) => {
        const data = map[subj.key];
        const latest = data[data.length - 1]?.net ?? 0;
        const prev = data.length > 1 ? data[data.length - 2]?.net : null;
        return { ...subj, data, latest, prev };
      });
  }, [filteredTrials, C]);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={s.backBtn}>
          <Icon name="arrowL" size={20} color={C.text} />
        </Pressable>
        <Text style={s.headerTitle}>Deneme Analizi</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filters */}
      <View style={s.filterRow}>
        {TYPE_FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[s.filterChip, filter === f.key && { backgroundColor: C.amber + "22", borderColor: C.amber }]}
          >
            <Text style={[s.filterText, filter === f.key && { color: C.amber }]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Overall stock chart */}
        <Animated.View entering={FadeInDown.delay(100)} style={s.mainCard}>
          <View style={s.mainHeader}>
            <View>
              <Text style={s.mainLabel}>Genel Net</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                <Text style={s.mainValue}>{latestNet.toFixed(1)}</Text>
                <ChangeBadge current={latestNet} previous={prevNet} C={C} />
              </View>
            </View>
            <Text style={s.trialCount}>{filteredTrials.length} deneme</Text>
          </View>
          <NetChart data={overallData} color={C.amber} C={C} showLabels />

          {/* Date labels */}
          {overallData.length >= 2 && (
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>{formatDate(overallData[0]?.date)}</Text>
              <Text style={s.dateLabel}>{formatDate(overallData[overallData.length - 1]?.date)}</Text>
            </View>
          )}
        </Animated.View>

        {/* Per-subject cards */}
        <Text style={s.sectionTitle}>Ders Bazlı Trend</Text>
        {subjectBreakdowns.map((subj, idx) => (
          <Animated.View key={subj.key} entering={FadeInDown.delay(200 + idx * 60)} style={s.subjCard}>
            <View style={s.subjHeader}>
              <View style={[s.subjDot, { backgroundColor: subj.color }]} />
              <Text style={s.subjName}>{subj.name}</Text>
              <View style={{ flex: 1 }} />
              <Text style={[s.subjNet, { color: subj.color }]}>{subj.latest.toFixed(1)}</Text>
              <ChangeBadge current={subj.latest} previous={subj.prev} C={C} />
            </View>
            <NetChart
              data={subj.data}
              color={subj.color}
              height={MINI_H}
              width={CHART_W}
              C={C}
              showLabels={false}
            />
          </Animated.View>
        ))}

        {filteredTrials.length === 0 && (
          <View style={s.empty}>
            <Icon name="trendUp" size={40} color={C.muted} />
            <Text style={s.emptyText}>Henüz deneme girişi yok</Text>
            <Text style={s.emptyDesc}>Deneme girdikçe net trendlerin burada görünecek</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 12, backgroundColor: C.surface,
      alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border,
    },
    headerTitle: { ...TYPOGRAPHY.subheading, color: C.text },

    filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
    filterChip: {
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
      borderWidth: 1, borderColor: C.border,
    },
    filterText: { ...TYPOGRAPHY.captionMedium, color: C.muted },

    scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },

    mainCard: {
      backgroundColor: C.surface, borderRadius: RADIUS.xxl, padding: SPACING.lg,
      borderWidth: 1, borderColor: C.border,
    },
    mainHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACING.md },
    mainLabel: { ...TYPOGRAPHY.captionMedium, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
    mainValue: { ...TYPOGRAPHY.stat, color: C.text, fontSize: 36 },
    trialCount: { ...TYPOGRAPHY.caption, color: C.muted, marginTop: 4 },
    dateRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
    dateLabel: { ...TYPOGRAPHY.micro, color: C.muted },

    sectionTitle: { ...TYPOGRAPHY.subheading, color: C.text, marginTop: SPACING.xl, marginBottom: SPACING.md },

    subjCard: {
      backgroundColor: C.surface, borderRadius: RADIUS.xl, padding: SPACING.md,
      borderWidth: 1, borderColor: C.border, marginBottom: SPACING.sm,
    },
    subjHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: SPACING.sm },
    subjDot: { width: 10, height: 10, borderRadius: 5 },
    subjName: { ...TYPOGRAPHY.bodyMedium, color: C.text },
    subjNet: { ...TYPOGRAPHY.statSmall, marginRight: 4 },

    empty: { alignItems: "center", paddingVertical: 60, gap: SPACING.md },
    emptyText: { ...TYPOGRAPHY.bodyMedium, color: C.text },
    emptyDesc: { ...TYPOGRAPHY.caption, color: C.muted, textAlign: "center" },
  });
}
