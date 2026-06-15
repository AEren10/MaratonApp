import { useState, useMemo, useCallback, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Icon, GlowBackground, WARM_GLOW, GlassCard } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useExam } from "../../contexts/ExamContext";
import { useAuth } from "../../contexts/AuthContext";
import { selectLatestTYT, selectLatestAYT } from "../../store/slices/trialSlice";
import { estimateRank, RANKING_DISCLAIMER } from "../../data/rankingTable";
import { PROGRAMS, getProgramById } from "../../data/programs";
import { getProfile, updateProfile } from "../../supabase/profiles";

const FIELD_TO_TYPE = { sayisal: "say", ea: "ea", sozel: "soz", dil: "ea" };

function fmt(n) {
  return n.toLocaleString("tr-TR");
}

function Stepper({ label, value, onChange, max }) {
  return (
    <View style={s.stepRow}>
      <Text style={s.stepLabel}>{label}</Text>
      <View style={s.stepCtrl}>
        <Pressable onPress={() => onChange(Math.max(0, value - 1))} style={s.stepBtn}>
          <Icon name="minus" size={14} color={C.text} />
        </Pressable>
        <Text style={s.stepValue}>{value.toFixed(1)}</Text>
        <Pressable onPress={() => onChange(Math.min(max, value + 1))} style={s.stepBtn}>
          <Icon name="plus" size={14} color={C.text} />
        </Pressable>
      </View>
    </View>
  );
}

export default function RankSimulatorScreen() {
  const navigation = useNavigation();
  const { field } = useExam();
  const { user } = useAuth();
  const type = FIELD_TO_TYPE[field] || "say";

  const latestTYT = useSelector(selectLatestTYT);
  const latestAYT = useSelector(selectLatestAYT);

  const baseTyt = latestTYT?.totalNet || 0;
  const baseAyt = latestAYT?.totalNet || 0;

  const [tytNet, setTytNet] = useState(baseTyt);
  const [aytNet, setAytNet] = useState(baseAyt);
  const [touched, setTouched] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Trials async geldiğinde (kullanıcı elle oynamadıysa) netleri son denemeye senkronla.
  useEffect(() => {
    if (touched) return;
    setTytNet(baseTyt);
    setAytNet(baseAyt);
  }, [baseTyt, baseAyt, touched]);

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    getProfile(user.id).then((p) => { if (p?.target_program_id) setTargetId(p.target_program_id); }).catch(() => {});
  }, [user?.id]);

  const onTyt = (v) => { setTouched(true); setTytNet(v); };
  const onAyt = (v) => { setTouched(true); setAytNet(v); };

  const baseRank = useMemo(() => estimateRank({ tytNet: baseTyt, aytNet: baseAyt, type }), [baseTyt, baseAyt, type]);
  const simRank = useMemo(() => estimateRank({ tytNet, aytNet, type }), [tytNet, aytNet, type]);

  const target = getProgramById(targetId);
  const reachable = target ? simRank <= target.rank : null;

  const selectTarget = useCallback(async (program) => {
    setTargetId(program.id);
    setPickerOpen(false);
    if (user?.id && user.id !== "dev") {
      updateProfile(user.id, { target_program_id: program.id }).catch(() => {});
    }
  }, [user?.id]);

  const typePrograms = PROGRAMS.filter((p) => p.type === type);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <GlowBackground blobs={WARM_GLOW} />
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={s.title}>Net Simülatörü</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Sıralama kartı */}
        <GlassCard radius={RADIUS.xxl} color={C.amber} style={s.rankCard}>
          <Text style={s.rankLabel}>Tahmini Sıralaman</Text>
          <View style={s.rankRow}>
            <Text style={s.rankOld}>{fmt(baseRank)}</Text>
            <Icon name="arrowR" size={20} color={C.amber} />
            <Text style={s.rankNew}>{fmt(simRank)}</Text>
          </View>
          <Text style={s.netSummary}>
            TYT {tytNet.toFixed(1)} · AYT {aytNet.toFixed(1)} net
          </Text>
        </GlassCard>

        {/* Hedef bölüm */}
        <Pressable onPress={() => setPickerOpen(true)} style={{ marginTop: SPACING.lg }}>
          <GlassCard radius={RADIUS.xl} style={s.targetCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.targetLabel}>HEDEF BÖLÜM</Text>
            {target ? (
              <Text style={s.targetName}>{target.name} · {target.uni}</Text>
            ) : (
              <Text style={[s.targetName, { color: C.muted }]}>Seç</Text>
            )}
            {target ? (
              <Text style={[s.targetHint, { color: reachable ? C.green : C.red }]}>
                {reachable
                  ? `Ulaştın! (kabul ~${fmt(target.rank)})`
                  : `Kabul için ~${fmt(target.rank)} gerek`}
              </Text>
            ) : null}
          </View>
          <Icon name="chevR" size={18} color={C.muted} />
          </GlassCard>
        </Pressable>

        {/* Net ayarı */}
        <Text style={s.sectionTitle}>NETLERİNİ DENE</Text>
        <GlassCard radius={RADIUS.xl} style={s.stepCard}>
          <Stepper label="TYT toplam net" value={tytNet} onChange={onTyt} max={120} />
          <Stepper label="AYT toplam net" value={aytNet} onChange={onAyt} max={80} />
          <Pressable onPress={() => { setTouched(false); setTytNet(baseTyt); setAytNet(baseAyt); }} style={s.resetBtn}>
            <Icon name="refresh" size={14} color={C.sec} />
            <Text style={s.resetText}>Son denemene sıfırla</Text>
          </Pressable>
        </GlassCard>

        <Text style={s.disclaimer}>{RANKING_DISCLAIMER}</Text>
      </ScrollView>

      {/* Hedef bölüm seçici */}
      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.handle} />
            <Text style={s.sheetTitle}>Hedef Bölüm Seç</Text>
            <FlatList
              data={typePrograms}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 380 }}
              renderItem={({ item }) => (
                <Pressable onPress={() => selectTarget(item)} style={s.progRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.progName}>{item.name}</Text>
                    <Text style={s.progUni}>{item.uni}</Text>
                  </View>
                  <Text style={s.progRank}>~{fmt(item.rank)}</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  title: { ...TYPOGRAPHY.subheading, color: C.text },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },
  rankCard: { padding: SPACING.xl, alignItems: "center" },
  rankLabel: { ...TYPOGRAPHY.label, color: C.muted },
  rankRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, marginTop: SPACING.sm },
  rankOld: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 24, color: C.muted, textDecorationLine: "line-through" },
  rankNew: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 34, color: C.amber, letterSpacing: -1 },
  netSummary: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: SPACING.sm },
  targetCard: { flexDirection: "row", alignItems: "center", padding: SPACING.lg },
  targetLabel: { ...TYPOGRAPHY.label, color: C.muted },
  targetName: { ...TYPOGRAPHY.bodySemiBold, color: C.text, marginTop: 2 },
  targetHint: { ...TYPOGRAPHY.caption, marginTop: 4 },
  sectionTitle: { ...TYPOGRAPHY.label, color: C.muted, marginTop: SPACING.xxl, marginBottom: SPACING.md },
  stepCard: { padding: SPACING.lg, gap: SPACING.md },
  stepRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepLabel: { ...TYPOGRAPHY.bodyMedium, color: C.text },
  stepCtrl: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  stepBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  stepValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 18, color: C.text, minWidth: 48, textAlign: "center" },
  resetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingTop: SPACING.sm },
  resetText: { ...TYPOGRAPHY.captionMedium, color: C.sec },
  disclaimer: { ...TYPOGRAPHY.micro, color: C.muted, marginTop: SPACING.xl, textAlign: "center", lineHeight: 16 },
  backdrop: { flex: 1, backgroundColor: "#000000AA", justifyContent: "flex-end" },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: SPACING.md },
  sheetTitle: { ...TYPOGRAPHY.subheading, color: C.text, marginBottom: SPACING.md },
  progRow: { flexDirection: "row", alignItems: "center", paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: C.border + "60" },
  progName: { ...TYPOGRAPHY.bodyMedium, color: C.text },
  progUni: { ...TYPOGRAPHY.caption, color: C.muted, marginTop: 2 },
  progRank: { ...TYPOGRAPHY.bodySemiBold, color: C.amber },
});
