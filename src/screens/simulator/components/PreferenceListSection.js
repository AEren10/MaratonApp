import { memo, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { buildPreferenceList } from "../../../domain/preference/preferenceEngine";
import { PROGRAMS, PROGRAMS_DISCLAIMER } from "../../../data/programs";
import { estimateRankDetails } from "../../../data/rankingTable";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { NetInputStepper } from "./NetInputStepper";
import { PreferenceProgramRow } from "./PreferenceProgramRow";

const SCORE_TYPES = [
  { key: "say", label: "SAY" }, { key: "ea", label: "EA" }, { key: "soz", label: "SÖZ" }, { key: "dil", label: "DİL" }, { key: "tyt", label: "TYT" },
];

const TAB_TONES = {
  safe: { bg: "18", color: "up", border: "up" },
  target: { bg: "18", color: "warn", border: "warn" },
  reach: { bg: "18", color: "accentBright", border: "accent" },
  blocked: { bg: "18", color: "danger", border: "danger" },
};

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

  const programsForType = useMemo(
    () => (scoreType === "tyt" ? PROGRAMS : PROGRAMS.filter((p) => p.type === scoreType)),
    [scoreType]
  );

  const prefResult = useMemo(
    () => buildPreferenceList(programsForType, rankDetails.rank, {
      size: 30,
      userNets: { tytNet, aytNet, type: scoreType },
    }),
    [programsForType, rankDetails.rank, tytNet, aytNet, scoreType]
  );

  const displayedList = useMemo(
    () => (filterTab === "blocked" ? prefResult.blocked : prefResult.list.filter((x) => x.status === filterTab)),
    [prefResult, filterTab]
  );

  const tabs = [
    { key: "safe", label: `Güvenli · ${prefResult.counts.safe}` },
    { key: "target", label: `Hedef · ${prefResult.counts.target}` },
    { key: "reach", label: `İddialı · ${prefResult.counts.reach}` },
    ...(prefResult.blocked.length > 0 ? [{ key: "blocked", label: `Baraj · ${prefResult.blocked.length}` }] : []),
  ];

  return (
    <View style={s.wrap}>
      <View style={s.typeRow}>
        {SCORE_TYPES.map((t) => {
          const act = scoreType === t.key;
          return (
            <Press
              key={t.key}
              haptic="tap"
              onPress={() => setScoreType(t.key)}
              style={[s.chip, { backgroundColor: act ? C.surface : C.void, borderColor: act ? C.accent : C.line }]}
            >
              <Text style={[TYPOGRAPHY.captionMedium, { color: act ? C.accentBright : C.text3 }]}>{t.label}</Text>
            </Press>
          );
        })}
      </View>

      <NetInputStepper label="TYT NETİ (120 Soru)" value={tytNet} onChange={setTytNet} max={120} />
      {scoreType !== "tyt" ? (
        <NetInputStepper label={`${scoreType.toUpperCase()} NETİ (80 Soru)`} value={aytNet} onChange={setAytNet} max={80} />
      ) : null}

      <View style={s.metricsRow}>
        <View style={[s.metricCard, { backgroundColor: C.surface, borderColor: C.line }]}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>TAHMİNİ PUAN</Text>
          <Text style={[TYPOGRAPHY.heading, s.heroNum, { color: C.text }]}>{rankDetails.scoreFormatted}</Text>
        </View>
        <View style={[s.metricCard, { backgroundColor: C.surface, borderColor: C.line }]}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>TAHMİNİ SIRALAMA</Text>
          <Text style={[TYPOGRAPHY.subheading, s.heroNum, { color: C.accentBright }]}>{rankDetails.rankBand}</Text>
        </View>
      </View>

      <View style={s.tabRow}>
        {tabs.map((tab) => {
          const act = filterTab === tab.key;
          const tone = TAB_TONES[tab.key];
          return (
            <Press
              key={tab.key}
              haptic="tap"
              onPress={() => setFilterTab(tab.key)}
              style={[
                s.filterChip,
                { backgroundColor: act ? C[tone.color] + tone.bg : C.surface, borderColor: act ? C[tone.border] : C.line },
              ]}
            >
              <Text style={[TYPOGRAPHY.micro, { color: act ? C[tone.color] : C.text3 }]}>{tab.label}</Text>
            </Press>
          );
        })}
      </View>

      <View style={s.list}>
        {displayedList.map((item) => (
          <PreferenceProgramRow
            key={item.program.id}
            item={item}
            scoreType={scoreType}
            tone={TAB_TONES[item.status] || TAB_TONES.safe}
            C={C}
          />
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
  chip: { flex: 1, height: 36, borderRadius: SHAPE.chip, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  metricsRow: { flexDirection: "row", gap: STEP.s2, marginTop: STEP.s3 },
  metricCard: { flex: 1, padding: STEP.s2, borderRadius: SHAPE.panel, borderWidth: 1 },
  heroNum: { marginTop: STEP.s1, fontVariant: ["tabular-nums"] },
  tabRow: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1, marginTop: STEP.s3 },
  filterChip: { paddingHorizontal: STEP.s2, height: 32, borderRadius: SHAPE.chip, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  list: { marginTop: STEP.s2, gap: STEP.s1 },
});
