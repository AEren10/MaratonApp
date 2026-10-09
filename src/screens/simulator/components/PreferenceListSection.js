import { memo, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { classifyProgram } from "../../../domain/preference/preferenceEngine";
import { PROGRAMS, PROGRAMS_DISCLAIMER } from "../../../data/programs";
import { estimateRankDetails } from "../../../data/rankingTable";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { PreferenceSimulatorCockpit } from "./PreferenceSimulatorCockpit";
import { PreferenceSearchBar } from "./PreferenceSearchBar";
import { PreferenceProgramRow } from "./PreferenceProgramRow";
import { PreferenceFilterTabs, TAB_TONES } from "./PreferenceFilterTabs";

export const PreferenceListSection = memo(function PreferenceListSection({
  initialTyt = 70,
  initialAyt = 45,
  initialType = "say",
}) {
  const C = useC();
  const [tytNet, setTytNet] = useState(initialTyt);
  const [aytNet, setAytNet] = useState(initialAyt);
  const [scoreType, setScoreType] = useState(initialType);
  const [filterTab, setFilterTab] = useState("all");
  const [query, setQuery] = useState("");

  const rankDetails = useMemo(
    () => estimateRankDetails({ tytNet, aytNet, type: scoreType }),
    [tytNet, aytNet, scoreType]
  );

  const programsForType = useMemo(
    () => (scoreType === "tyt" ? PROGRAMS : PROGRAMS.filter((p) => p.type === scoreType)),
    [scoreType]
  );

  const allClassified = useMemo(() => {
    return programsForType
      .map((p) => classifyProgram(p, rankDetails.rank, { tytNet, aytNet, type: scoreType }))
      .filter(Boolean)
      .sort((a, b) => (a.program.rank || 0) - (b.program.rank || 0));
  }, [programsForType, rankDetails.rank, tytNet, aytNet, scoreType]);

  const counts = useMemo(() => ({
    all: allClassified.length,
    safe: allClassified.filter((x) => x.status === "safe").length,
    target: allClassified.filter((x) => x.status === "target").length,
    reach: allClassified.filter((x) => x.status === "reach").length,
    blocked: allClassified.filter((x) => x.status === "blocked").length,
  }), [allClassified]);

  const displayedList = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return allClassified.filter((item) => {
      const matchQuery = !q ||
        item.program.name.toLocaleLowerCase("tr").includes(q) ||
        (item.program.uni && item.program.uni.toLocaleLowerCase("tr").includes(q));
      if (!matchQuery) return false;
      if (filterTab === "all") return true;
      return item.status === filterTab;
    });
  }, [allClassified, query, filterTab]);

  const tabs = [
    { key: "all", label: `Tümü · ${counts.all}` },
    { key: "safe", label: `Güvenli · ${counts.safe}` },
    { key: "target", label: `Hedef · ${counts.target}` },
    { key: "reach", label: `İddialı · ${counts.reach}` },
    ...(counts.blocked > 0 ? [{ key: "blocked", label: `Baraj · ${counts.blocked}` }] : []),
  ];

  return (
    <View style={s.wrap}>
      <PreferenceSimulatorCockpit
        scoreType={scoreType}
        onSelectScoreType={setScoreType}
        rankDetails={rankDetails}
        tytNet={tytNet}
        onChangeTyt={setTytNet}
        aytNet={aytNet}
        onChangeAyt={setAytNet}
        C={C}
      />

      <PreferenceSearchBar query={query} onChangeQuery={setQuery} C={C} />

      <PreferenceFilterTabs
        tabs={tabs}
        filterTab={filterTab}
        onSelectTab={setFilterTab}
        C={C}
      />

      <View style={s.sectionHeader}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>
          {query ? `ARAMA SONUÇLARI (${displayedList.length})` : `BÖLÜM LİSTESİ (${displayedList.length})`}
        </Text>
      </View>

      <View style={s.list}>
        {displayedList.length > 0 ? (
          displayedList.map((item) => (
            <PreferenceProgramRow
              key={item.program.id}
              item={item}
              scoreType={scoreType}
              tone={TAB_TONES[item.status] || TAB_TONES.safe}
              C={C}
            />
          ))
        ) : (
          <View style={[s.emptyBox, { backgroundColor: C.surface, borderColor: C.line }]}>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, textAlign: "center" }]}>
              Eşleşen bölüm bulunamadı
            </Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3, textAlign: "center", marginTop: 4 }]}>
              {query ? `"${query}" aramanıza uygun bölüm listelenemedi.` : "Bu filtrede bölüm bulunmuyor."}
            </Text>
            {query || filterTab !== "all" ? (
              <Press
                haptic="tap"
                onPress={() => { setQuery(""); setFilterTab("all"); }}
                style={[s.resetBtn, { backgroundColor: C.void, borderColor: C.line }]}
              >
                <Text style={[TYPOGRAPHY.captionMedium, { color: C.accentBright }]}>Filtreleri Temizle</Text>
              </Press>
            ) : null}
          </View>
        )}
      </View>

      <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s3, textAlign: "center" }]}>
        {PROGRAMS_DISCLAIMER}
      </Text>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s2 },
  sectionHeader: { marginTop: STEP.s3, marginBottom: STEP.s1 },
  list: { gap: STEP.s1 },
  emptyBox: { padding: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1, alignItems: "center", gap: STEP.s1 },
  resetBtn: { marginTop: STEP.s1, paddingHorizontal: STEP.s3, height: 36, borderRadius: SHAPE.chip, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
