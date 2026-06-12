import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import { useSelector } from "react-redux";
import { Icon, Chip } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { selectTrials } from "../../store/slices/trialSlice";
import { useAuth } from "../../contexts/AuthContext";
import { getMyPercentiles } from "../../supabase/percentile";
import { TRIAL_TYPES, ALL_SUBJECTS } from "./trialTypes";
import { TrialReportCard } from "./components/TrialReportCard";

function ScoreRing({ size = 140, stroke = 10, net, max = 120 }) {
  const pct = Math.min(net / max, 1);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const color = pct >= 0.7 ? C.green : pct >= 0.5 ? C.amber : C.red;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>{net.toFixed(1)}</Text>
      <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>/ {max}</Text>
    </View>
  );
}

function SubjectRow({ name, color, net, max, percentile }) {
  const pct = max > 0 ? Math.min(net / max, 1) : 0;
  return (
    <View style={styles.subjRow}>
      <View style={[styles.subjDot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{name}</Text>
        {percentile != null ? (
          <Text style={[TYPOGRAPHY.micro, { color: C.green, marginTop: 2 }]}>
            %{percentile} öğrenciden iyisin
          </Text>
        ) : null}
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[TYPOGRAPHY.statSmall, { color, minWidth: 50, textAlign: "right" }]}>
        {net.toFixed(1)}
      </Text>
      <Text style={[TYPOGRAPHY.caption, { color: C.muted }]}>/ {max}</Text>
    </View>
  );
}

function getSubjectsForTrial(trial) {
  if (!trial?.trialType) {
    // legacy trial — try to recover from subject keys
    return Object.keys(trial?.subjects || {}).map((k) => {
      const found = ALL_SUBJECTS.find((s) => s.key === k);
      return found || { key: k, name: k, color: C.amber, max: 40 };
    });
  }
  if (trial.trialType === "BRANCH" && trial.branchSubject) {
    return ALL_SUBJECTS.filter((s) => s.key === trial.branchSubject);
  }
  const type = TRIAL_TYPES[trial.trialType];
  return type?.subjects || [];
}

export default function TrialDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const trials = useSelector(selectTrials);
  const { user } = useAuth();
  const cardRef = useRef(null);
  const [percentiles, setPercentiles] = useState({});

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    let cancelled = false;
    getMyPercentiles().then((p) => { if (!cancelled) setPercentiles(p); }).catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]);

  const trial = route.params?.trial;
  const sorted = useMemo(
    () => [...trials].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [trials]
  );

  const latest = useMemo(() => {
    if (!trial) return sorted[0];
    return trials.find((t) => t.id === trial.id) || trial;
  }, [trial, trials, sorted]);

  if (!latest) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={12}>
            <Icon name="arrowL" size={22} color={C.text} />
          </Pressable>
          <Text style={[TYPOGRAPHY.subheading, { color: C.text, marginLeft: SPACING.md }]}>
            Deneme Detayı
          </Text>
        </View>
        <View style={styles.emptyBox}>
          <Icon name="alert" size={40} color={C.muted} />
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.muted, marginTop: SPACING.md }]}>
            Deneme bulunamadı
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const subjects = getSubjectsForTrial(latest);
  const sameTypeTrials = sorted.filter((t) => t.trialType === latest.trialType);
  const idxInType = sameTypeTrials.findIndex((t) => t.id === latest.id);
  const prev = sameTypeTrials[idxInType + 1];

  const net = latest.totalNet || 0;
  const trend = prev ? net - (prev.totalNet || 0) : 0;
  const trendColor = trend > 0 ? C.green : trend < 0 ? C.red : C.muted;
  const dateStr = latest.date
    ? new Date(latest.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const totalMax = subjects.reduce((sum, s) => sum + s.max, 0);
  const typeMeta = TRIAL_TYPES[latest.trialType];

  const bars = subjects.map((s) => ({
    key: s.key,
    name: s.name,
    c: s.color,
    net: latest.subjects?.[s.key]?.net || 0,
    correct: latest.subjects?.[s.key]?.correct || 0,
    wrong: latest.subjects?.[s.key]?.wrong || 0,
    max: s.max,
  }));

  const history = sameTypeTrials.slice(0, 6).map((t, i) => {
    const prevT = sameTypeTrials[i + 1];
    return {
      date: new Date(t.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
      net: t.totalNet || 0,
      trend: prevT ? (t.totalNet || 0) - (prevT.totalNet || 0) : 0,
    };
  });

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Öğrenci";

  const handleShare = async () => {
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Paylaşım yok", "Bu cihazda paylaşım kullanılamıyor.");
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Deneme karneni paylaş" });
    } catch (e) {
      Alert.alert("Hata", "Karne oluşturulamadı, tekrar dene.");
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>
          Deneme Detayı
        </Text>
        <Chip color={C.surface2}>{dateStr}</Chip>
        <Pressable onPress={handleShare} hitSlop={12} style={styles.shareBtn}>
          <Icon name="share" size={18} color={C.amber} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          {typeMeta && (
            <View style={{ marginBottom: SPACING.md }}>
              <Chip color={typeMeta.color}>
                <Text style={{ color: typeMeta.color, ...TYPOGRAPHY.micro, letterSpacing: 0.5 }}>
                  {typeMeta.label.toUpperCase()}
                </Text>
              </Chip>
            </View>
          )}
          <ScoreRing net={net} max={totalMax || 120} />
          <View style={styles.trendBadge}>
            <Icon name={trend >= 0 ? "trendUp" : "trendDown"} size={14} color={trendColor} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: trendColor }]}>
              {trend > 0 ? "+" : ""}{trend.toFixed(1)} net
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>
            DERS BAZLI SONUCLAR
          </Text>
          {bars.map((b) => (
            <SubjectRow key={b.name} name={b.name} color={b.c} net={b.net} max={b.max} percentile={percentiles[b.key]?.percentile} />
          ))}
        </View>

        {history.length > 1 && (
          <View style={styles.section}>
            <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>
              GECMIS {typeMeta?.label.toUpperCase() || ""} DENEMELERI
            </Text>
            {history.map((h, i) => (
              <View key={i} style={styles.histRow}>
                <Text style={[TYPOGRAPHY.captionMedium, { color: C.sec, width: 60 }]}>{h.date}</Text>
                <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text, flex: 1 }]}>
                  {h.net.toFixed(1)} net
                </Text>
                {h.trend !== 0 && (
                  <View style={[styles.miniTrend, { backgroundColor: (h.trend > 0 ? C.green : C.red) + "20" }]}>
                    <Icon name={h.trend > 0 ? "trendUp" : "trendDown"} size={12} color={h.trend > 0 ? C.green : C.red} />
                    <Text style={[TYPOGRAPHY.micro, { color: h.trend > 0 ? C.green : C.red }]}>
                      {h.trend > 0 ? "+" : ""}{h.trend.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Paylaşım için ekran dışı render edilen karne */}
      <View style={styles.offscreen} pointerEvents="none">
        <TrialReportCard
          ref={cardRef}
          name={displayName}
          typeLabel={typeMeta?.label || latest.name || "Deneme"}
          net={net}
          dateStr={dateStr}
          bars={bars}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },
  scoreCard: {
    alignItems: "center", paddingVertical: SPACING.xxxl,
    backgroundColor: C.surface, borderRadius: RADIUS.xxl,
    marginBottom: SPACING.xxl,
  },
  trendBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    marginTop: SPACING.md, backgroundColor: C.surface2,
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
  },
  section: { marginBottom: SPACING.xxl },
  subjRow: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  subjDot: { width: 8, height: 8, borderRadius: 4 },
  barBg: {
    width: 60, height: 6, borderRadius: 3, backgroundColor: C.surface2, overflow: "hidden",
  },
  barFill: { height: 6, borderRadius: 3 },
  histRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  miniTrend: {
    flexDirection: "row", alignItems: "center", gap: 2,
    borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3,
  },
  emptyBox: {
    flex: 1, alignItems: "center", justifyContent: "center",
  },
  shareBtn: {
    marginLeft: SPACING.sm,
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: C.amber + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  offscreen: {
    position: "absolute",
    left: -10000,
    top: 0,
  },
});
