import { memo, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { buildPreferenceList, PREFERENCE_STATUS_LABELS } from "../../../domain/preference/preferenceEngine";
import { PROGRAMS, PROGRAMS_DISCLAIMER } from "../../../data/programs";
import { estimateRankDetails } from "../../../data/rankingTable";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { NetInputStepper } from "./NetInputStepper";

const SCORE_TYPES = [
  { key: "say", label: "SAY" },
  { key: "ea", label: "EA" },
  { key: "soz", label: "SÖZ" },
  { key: "dil", label: "DİL" },
  { key: "tyt", label: "TYT" },
];

export const PreferenceListSection = memo(function PreferenceListSection({
  initialTyt = 70,
  initialAyt = 45,
  initialType = "say",
}) {
  const C = useC();
  const [tytNet, setTytNet] = useState(initialTyt);
  const [aytNet, setAytNet] = useState(initialAyt);
  const [scoreType, setScoreType] = useState(initialType);
  const [filterTab, setFilterTab] = useState("safe");

  const rankDetails = useMemo(
    () => estimateRankDetails({ tytNet, aytNet, type: scoreType }),
    [tytNet, aytNet, scoreType]
  );

  const programsForType = useMemo(() => {
    if (scoreType === "tyt") return PROGRAMS;
    return PROGRAMS.filter((p) => p.type === scoreType);
  }, [scoreType]);

  const prefResult = useMemo(
    () => buildPreferenceList(programsForType, rankDetails.rank, { size: 30 }),
    [programsForType, rankDetails.rank]
  );

  const displayedList = useMemo(() => {
    if (filterTab === "blocked") return prefResult.blocked;
    return prefResult.list.filter((x) => x.status === filterTab);
  }, [prefResult, filterTab]);

  return (
    <View style={s.wrap}>
      <View style={s.typeRow}>
        {SCORE_TYPES.map((t) => (
          <Press
            key={t.key}
            haptic="tap"
            onPress={() => setScoreType(t.key)}
            style={[s.chip, scoreType === t.key && { backgroundColor: C.surface, borderColor: C.accent }]}
          >
            <Text style={[TYPOGRAPHY.captionMedium, { color: scoreType === t.key ? C.accentText : C.text3 }]}>
              {t.label}
            </Text>
          </Press>
        ))}
      </View>

      <NetInputStepper label="TYT NETİ (120 Soru)" value={tytNet} onChange={setTytNet} max={120} />
      {scoreType !== "tyt" ? (
        <NetInputStepper label={`${scoreType.toUpperCase()} NETİ (80 Soru)`} value={aytNet} onChange={setAytNet} max={80} />
      ) : null}

      <View style={s.metricsRow}>
        <View style={[s.metricCard, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>TAHMİNİ PUAN</Text>
          <Text style={[TYPOGRAPHY.heading, s.heroNum, { color: C.text }]}>{rankDetails.scoreFormatted}</Text>
        </View>
        <View style={[s.metricCard, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>TAHMİNİ SIRALAMA</Text>
          <Text style={[TYPOGRAPHY.subheading, s.heroNum, { color: C.text }]}>{rankDetails.rankBand}</Text>
        </View>
      </View>

      <View style={s.tabRow}>
        {[
          { key: "safe", label: `Girebilirsin · ${prefResult.counts.safe}` },
          { key: "target", label: `Hedef · ${prefResult.counts.target}` },
          { key: "reach", label: `İddialı · ${prefResult.counts.reach}` },
          ...(prefResult.blocked.length > 0 ? [{ key: "blocked", label: `Baraj · ${prefResult.blocked.length}` }] : []),
        ].map((tab) => (
          <Press
            key={tab.key}
            haptic="tap"
            onPress={() => setFilterTab(tab.key)}
            style={[s.filterChip, filterTab === tab.key && { backgroundColor: C.brandTint, borderColor: C.accent }]}
          >
            <Text style={[TYPOGRAPHY.micro, { color: filterTab === tab.key ? C.text : C.text3 }]}>{tab.label}</Text>
          </Press>
        ))}
      </View>

      <View style={s.list}>
        {displayedList.map((item) => (
          <View key={item.program.id} style={[s.programCard, { backgroundColor: C.surface, borderColor: C.elev }]}>
            <View style={s.programInfo}>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>{item.program.name}</Text>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 2 }]} numberOfLines={1}>
                {`${item.program.uni} · ${item.program.rank?.toLocaleString("tr-TR")}. sıra`}
              </Text>
            </View>
            <View style={s.programBadge}>
              <Text style={[TYPOGRAPHY.micro, { color: item.status === "safe" ? C.up : item.status === "blocked" ? C.danger : C.accentText }]}>
                {item.status === "blocked" ? "Baraj" : PREFERENCE_STATUS_LABELS[item.status]}
              </Text>
              <Text style={[TYPOGRAPHY.meta, s.tabNum, { color: C.text2, marginTop: 2 }]}>
                {scoreType === "tyt" ? `${item.program.tytNet} net` : `${item.program.totalNet} net`}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s3, textAlign: "center" }]}>
        {PROGRAMS_DISCLAIMER}
      </Text>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s2 },
  typeRow: { flexDirection: "row", gap: STEP.s1 },
  chip: { flex: 1, height: 36, borderRadius: SHAPE.chip, borderWidth: 1, borderColor: "transparent", alignItems: "center", justifyContent: "center" },
  metricsRow: { flexDirection: "row", gap: STEP.s2, marginTop: STEP.s3 },
  metricCard: { flex: 1, padding: STEP.s3 - 4, borderRadius: SHAPE.panel, borderWidth: 1 },
  heroNum: { marginTop: STEP.s1, fontVariant: ["tabular-nums"] },
  tabRow: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1, marginTop: STEP.s3 },
  filterChip: { paddingHorizontal: STEP.s2, height: 32, borderRadius: SHAPE.chip, borderWidth: 1, borderColor: "transparent", alignItems: "center", justifyContent: "center" },
  list: { marginTop: STEP.s2, gap: STEP.s1 },
  programCard: { flexDirection: "row", alignItems: "center", paddingVertical: STEP.s2, paddingHorizontal: STEP.s3 - 4, borderRadius: SHAPE.panel, borderWidth: 1 },
  programInfo: { flex: 1, minWidth: 0 },
  programBadge: { alignItems: "flex-end" },
  tabNum: { fontVariant: ["tabular-nums"] },
});
