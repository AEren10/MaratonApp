import React, { useState, useMemo, useCallback, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { useAuth } from "../../contexts/AuthContext";
import { selectLatestTYT, selectLatestAYT } from "../../store/slices/trialSlice";
import { estimateRank, RANKING_DISCLAIMER } from "../../data/rankingTable";
import { getProgramById } from "../../data/programs";
import { getProfile, updateProfile } from "../../supabase/profiles";
import * as H from "../../lib/haptics";
import SubjectInputRow from "./components/SubjectInputRow";
import ProgramPickerModal from "./components/ProgramPickerModal";
import { FIELD_TO_TYPE, TYT_SUBJECTS, AYT_SUBJECTS_BY_TYPE, SUBJECT_COLORS, calcNet, initialFrom } from "./simulatorConstants";

const fmt = (n) => n.toLocaleString("tr-TR");

export default function RankSimulatorScreen() {
  const navigation = useNavigation();
  const C = useC();
  const { field } = useExam();
  const { user } = useAuth();
  const type = FIELD_TO_TYPE[field] || "say";
  const latestTYT = useSelector(selectLatestTYT);
  const latestAYT = useSelector(selectLatestAYT);
  const aytSubjects = AYT_SUBJECTS_BY_TYPE[type] || AYT_SUBJECTS_BY_TYPE.say;

  const [tytValues, setTytValues] = useState(() => initialFrom(TYT_SUBJECTS, latestTYT));
  const [aytValues, setAytValues] = useState(() => initialFrom(aytSubjects, latestAYT));
  const [touched, setTouched] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (touched) return;
    setTytValues(initialFrom(TYT_SUBJECTS, latestTYT));
    setAytValues(initialFrom(aytSubjects, latestAYT));
  }, [latestTYT, latestAYT, touched, type]); // eslint-disable-line

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    getProfile(user.id).then((p) => { if (p?.target_program_id) setTargetId(p.target_program_id); }).catch(() => {});
  }, [user?.id]);

  const totalNet = (values) => Object.values(values).reduce((s, v) => s + calcNet(v.c, v.w), 0);
  const tytNet = useMemo(() => totalNet(tytValues), [tytValues]);
  const aytNet = useMemo(() => totalNet(aytValues), [aytValues]);
  const baseTytNet = latestTYT?.totalNet || 0;
  const baseAytNet = latestAYT?.totalNet || 0;
  const baseRank = useMemo(() => estimateRank({ tytNet: baseTytNet, aytNet: baseAytNet, type }), [baseTytNet, baseAytNet, type]);
  const simRank = useMemo(() => estimateRank({ tytNet, aytNet, type }), [tytNet, aytNet, type]);
  const delta = baseRank - simRank;
  const target = getProgramById(targetId);
  const reachable = target ? simRank <= target.rank : null;

  const selectTarget = useCallback(async (program) => {
    H.select();
    setTargetId(program.id);
    setPickerOpen(false);
    if (user?.id && user.id !== "dev") updateProfile(user.id, { target_program_id: program.id }).catch(() => {});
  }, [user?.id]);

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}><Icon name="arrowL" size={22} color={C.text} /></Pressable>
        <Text style={[styles.title, { color: C.text }]}>Net Simülatörü</Text>
        <Pressable onPress={() => { H.tap(); setTouched(false); }} hitSlop={12}><Icon name="refresh" size={20} color={C.muted} /></Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(420).springify()} style={[styles.rankCard, { backgroundColor: C.accent + "14", borderColor: C.accent + "30" }]}>
          <Text style={[styles.rankLabel, { color: C.accent }]}>TAHMİNİ SIRALAMAN</Text>
          <Text style={[styles.rankBig, { color: C.text }]}>{fmt(simRank)}</Text>
          {baseRank !== simRank && (
            <View style={[styles.deltaChip, { backgroundColor: (delta > 0 ? C.green : C.red) + "20" }]}>
              <Icon name={delta > 0 ? "trendUp" : "trendDown"} size={12} color={delta > 0 ? C.green : C.red} />
              <Text style={[styles.deltaText, { color: delta > 0 ? C.green : C.red }]}>{delta > 0 ? "↑" : "↓"} {fmt(Math.abs(delta))} sıra</Text>
            </View>
          )}
          <Text style={[styles.netSummary, { color: C.sec }]}>TYT {tytNet.toFixed(1)} · AYT {aytNet.toFixed(1)} net</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(420).springify()}>
          <Pressable onPress={() => { H.tap(); setPickerOpen(true); }} style={{ marginTop: 14 }}>
            <View style={[styles.targetCard, { backgroundColor: C.surface, borderColor: C.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.targetLabel, { color: C.muted }]}>HEDEF BÖLÜM</Text>
                {target ? (
                  <>
                    <Text style={[styles.targetName, { color: C.text }]} numberOfLines={1}>{target.name}</Text>
                    <Text style={[styles.targetUni, { color: C.sec }]} numberOfLines={1}>{target.uni}</Text>
                    <View style={styles.targetStatus}>
                      <Icon name={reachable ? "check" : "alert"} size={13} color={reachable ? C.green : C.red} />
                      <Text style={[styles.targetHint, { color: reachable ? C.green : C.red }]}>
                        {reachable ? `Ulaştın! (kabul ~${fmt(target.rank)})` : `Kabul için ~${fmt(target.rank)} gerek`}
                      </Text>
                    </View>
                  </>
                ) : <Text style={[styles.targetName, { color: C.muted }]}>Bölüm seç</Text>}
              </View>
              <View style={[styles.targetIcon, { backgroundColor: C.accent + "1A" }]}><Icon name="chevR" size={18} color={C.accent} /></View>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(420).springify()}>
          <Text style={[styles.sectionTitle, { color: C.muted }]}>TYT NETLERİN</Text>
          {TYT_SUBJECTS.map((subj) => (
            <SubjectInputRow key={subj.key} subject={subj} values={tytValues[subj.key] || { c: "", w: "" }} onChange={(v) => { setTouched(true); setTytValues((p) => ({ ...p, [subj.key]: v })); }} color={C[SUBJECT_COLORS[subj.key]] || C.purple} C={C} />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(210).duration(420).springify()}>
          <Text style={[styles.sectionTitle, { color: C.muted }]}>AYT NETLERİN ({type.toUpperCase()})</Text>
          {aytSubjects.map((subj) => (
            <SubjectInputRow key={subj.key} subject={subj} values={aytValues[subj.key] || { c: "", w: "" }} onChange={(v) => { setTouched(true); setAytValues((p) => ({ ...p, [subj.key]: v })); }} color={C[SUBJECT_COLORS[subj.key]] || C.purple} C={C} />
          ))}
        </Animated.View>

        <Text style={[styles.disclaimer, { color: C.muted }]}>{RANKING_DISCLAIMER}</Text>
      </ScrollView>

      <ProgramPickerModal visible={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={selectTarget} type={type} C={C} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  title: { ...TYPOGRAPHY.subheading },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },
  rankCard: { padding: 22, alignItems: "center", borderRadius: 26, borderWidth: 1 },
  rankLabel: { ...TYPOGRAPHY.label, letterSpacing: 0.8 },
  rankBig: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 44, marginTop: 6, letterSpacing: -1.5 },
  deltaChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 8 },
  deltaText: { ...TYPOGRAPHY.captionMedium },
  netSummary: { ...TYPOGRAPHY.caption, marginTop: 10 },
  targetCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 22, borderWidth: 1 },
  targetLabel: { ...TYPOGRAPHY.label, letterSpacing: 0.6 },
  targetName: { ...TYPOGRAPHY.bodySemiBold, marginTop: 4, fontSize: 16 },
  targetUni: { ...TYPOGRAPHY.caption, marginTop: 2 },
  targetStatus: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  targetHint: { ...TYPOGRAPHY.captionMedium },
  targetIcon: { width: 32, height: 32, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  sectionTitle: { ...TYPOGRAPHY.label, marginTop: 24, marginBottom: 10 },
  disclaimer: { ...TYPOGRAPHY.micro, marginTop: SPACING.xl, textAlign: "center", lineHeight: 16 },
});
