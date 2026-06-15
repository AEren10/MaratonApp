import { useState, useMemo, useCallback, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, FlatList, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { useAuth } from "../../contexts/AuthContext";
import { selectLatestTYT, selectLatestAYT } from "../../store/slices/trialSlice";
import { estimateRank, RANKING_DISCLAIMER } from "../../data/rankingTable";
import { PROGRAMS, PROGRAM_CATEGORIES, getProgramById, searchPrograms } from "../../data/programs";
import { getProfile, updateProfile } from "../../supabase/profiles";

const FIELD_TO_TYPE = { sayisal: "say", ea: "ea", sozel: "soz", dil: "ea" };
const fmt = (n) => n.toLocaleString("tr-TR");

// === Subject groups per AYT field ===
// rank simulation için kullanıcının ders ders D/Y/B girebilmesini sağla
const TYT_SUBJECTS = [
  { key: "turkce",     name: "Türkçe",      max: 40 },
  { key: "matematik",  name: "Matematik",   max: 40 },
  { key: "fen",        name: "Fen",         max: 20 },
  { key: "sosyal",     name: "Sosyal",      max: 20 },
];

const AYT_SUBJECTS_BY_TYPE = {
  say: [
    { key: "matematik", name: "AYT Matematik", max: 40 },
    { key: "fizik",     name: "Fizik",         max: 14 },
    { key: "kimya",     name: "Kimya",         max: 13 },
    { key: "biyoloji",  name: "Biyoloji",      max: 13 },
  ],
  ea: [
    { key: "matematik", name: "AYT Matematik", max: 40 },
    { key: "edebiyat",  name: "Edebiyat",      max: 24 },
    { key: "tarih1",    name: "Tarih-1",       max: 10 },
    { key: "cografya1", name: "Coğrafya-1",    max: 6 },
  ],
  soz: [
    { key: "edebiyat",  name: "Edebiyat",      max: 24 },
    { key: "tarih1",    name: "Tarih-1",       max: 10 },
    { key: "cografya1", name: "Coğrafya-1",    max: 6 },
    { key: "tarih2",    name: "Tarih-2",       max: 11 },
    { key: "cografya2", name: "Coğrafya-2",    max: 11 },
    { key: "felsefe",   name: "Felsefe",       max: 12 },
    { key: "din",       name: "Din",           max: 6 },
  ],
};

function net(correct, wrong) {
  const c = parseInt(correct, 10) || 0;
  const w = parseInt(wrong, 10) || 0;
  return Math.max(0, c - w * 0.25);
}

function SubjectRow({ subject, values, onChange, C, color }) {
  const totalNet = net(values.c, values.w);
  return (
    <View style={[srs.row, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={[srs.stripe, { backgroundColor: color }]} />
      <View style={srs.body}>
        <View style={srs.head}>
          <Text style={[srs.name, { color: C.text }]} numberOfLines={1}>{subject.name}</Text>
          <Text style={[srs.netBadge, { backgroundColor: color + "1A", color }]}>
            {totalNet.toFixed(2)} net
          </Text>
        </View>
        <View style={srs.inputs}>
          <NumInput
            label="D"
            value={values.c}
            onChange={(t) => onChange({ ...values, c: t.replace(/[^0-9]/g, "") })}
            tone={C.green}
            max={subject.max}
            C={C}
          />
          <NumInput
            label="Y"
            value={values.w}
            onChange={(t) => onChange({ ...values, w: t.replace(/[^0-9]/g, "") })}
            tone={C.red}
            max={subject.max}
            C={C}
          />
          <Text style={[srs.maxLabel, { color: C.muted }]}>/ {subject.max}</Text>
        </View>
      </View>
    </View>
  );
}

function NumInput({ label, value, onChange, tone, max, C }) {
  return (
    <View style={srs.inputWrap}>
      <Text style={[srs.inputLabel, { color: tone }]}>{label}</Text>
      <TextInput
        value={String(value || "")}
        onChangeText={onChange}
        keyboardType="number-pad"
        maxLength={String(max).length}
        placeholder="0"
        placeholderTextColor={C.muted}
        style={[srs.input, { color: C.text, borderColor: tone + "30", backgroundColor: C.surface2 }]}
      />
    </View>
  );
}

export default function RankSimulatorScreen() {
  const navigation = useNavigation();
  const C = useC();
  const { field } = useExam();
  const { user } = useAuth();
  const type = FIELD_TO_TYPE[field] || "say";

  const latestTYT = useSelector(selectLatestTYT);
  const latestAYT = useSelector(selectLatestAYT);

  // Initial values from latest trials
  const initialFrom = (subjects, source) => {
    const out = {};
    subjects.forEach((s) => {
      // Trial keys: tyt_turkce, ayt_matematik ...
      const tk = source?.subjects || {};
      const key1 = `tyt_${s.key}`;
      const key2 = `ayt_${s.key}`;
      const data = tk[key1] || tk[key2] || {};
      out[s.key] = { c: String(data.correct || ""), w: String(data.wrong || "") };
    });
    return out;
  };

  const aytSubjects = AYT_SUBJECTS_BY_TYPE[type] || AYT_SUBJECTS_BY_TYPE.say;
  const [tytValues, setTytValues] = useState(() => initialFrom(TYT_SUBJECTS, latestTYT));
  const [aytValues, setAytValues] = useState(() => initialFrom(aytSubjects, latestAYT));
  const [touched, setTouched] = useState(false);

  // Trial async geldiğinde bağlanmadıysa son denemeye senkronla.
  useEffect(() => {
    if (touched) return;
    setTytValues(initialFrom(TYT_SUBJECTS, latestTYT));
    setAytValues(initialFrom(aytSubjects, latestAYT));
  }, [latestTYT, latestAYT, touched, type]); // eslint-disable-line

  const totalNet = (values) =>
    Object.values(values).reduce((s, v) => s + net(v.c, v.w), 0);

  const tytNet = useMemo(() => totalNet(tytValues), [tytValues]);
  const aytNet = useMemo(() => totalNet(aytValues), [aytValues]);

  const baseTytNet = latestTYT?.totalNet || 0;
  const baseAytNet = latestAYT?.totalNet || 0;
  const baseRank = useMemo(() => estimateRank({ tytNet: baseTytNet, aytNet: baseAytNet, type }), [baseTytNet, baseAytNet, type]);
  const simRank = useMemo(() => estimateRank({ tytNet, aytNet, type }), [tytNet, aytNet, type]);
  const delta = baseRank - simRank;

  const [targetId, setTargetId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(null);

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    getProfile(user.id)
      .then((p) => { if (p?.target_program_id) setTargetId(p.target_program_id); })
      .catch(() => {});
  }, [user?.id]);

  const target = getProgramById(targetId);
  const reachable = target ? simRank <= target.rank : null;

  const selectTarget = useCallback(async (program) => {
    setTargetId(program.id);
    setPickerOpen(false);
    if (user?.id && user.id !== "dev") {
      updateProfile(user.id, { target_program_id: program.id }).catch(() => {});
    }
  }, [user?.id]);

  const filteredPrograms = useMemo(
    () => searchPrograms(query, { type, category }),
    [query, type, category]
  );

  const subjectColors = {
    turkce: C.blue, matematik: C.amber, fen: C.green, sosyal: C.purple,
    fizik: C.blue, kimya: C.teal, biyoloji: C.green,
    edebiyat: C.pink, tarih1: C.red, cografya1: C.green, tarih2: C.amber,
    cografya2: C.teal, felsefe: C.purple, din: C.yellow,
  };

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[s.title, { color: C.text }]}>Net Simülatörü</Text>
        <Pressable onPress={() => { setTouched(false); }} hitSlop={12}>
          <Icon name="refresh" size={20} color={C.muted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* === Sıralama hero === */}
        <View style={[s.rankCard, { backgroundColor: C.purple + "14", borderColor: C.purple + "30" }]}>
          <Text style={[s.rankLabel, { color: C.purple }]}>TAHMİNİ SIRALAMAN</Text>
          <Text style={[s.rankBig, { color: C.text }]}>{fmt(simRank)}</Text>
          {baseRank !== simRank && (
            <View style={[s.deltaChip, { backgroundColor: delta > 0 ? C.green + "20" : C.red + "20" }]}>
              <Icon name={delta > 0 ? "trendUp" : "trendDown"} size={12} color={delta > 0 ? C.green : C.red} />
              <Text style={[s.deltaText, { color: delta > 0 ? C.green : C.red }]}>
                {delta > 0 ? "↑" : "↓"} {fmt(Math.abs(delta))} sıra
              </Text>
            </View>
          )}
          <Text style={[s.netSummary, { color: C.sec }]}>
            TYT {tytNet.toFixed(1)} · AYT {aytNet.toFixed(1)} net
          </Text>
        </View>

        {/* === Hedef bölüm === */}
        <Pressable onPress={() => setPickerOpen(true)} style={{ marginTop: 14 }}>
          <View style={[s.targetCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.targetLabel, { color: C.muted }]}>HEDEF BÖLÜM</Text>
              {target ? (
                <>
                  <Text style={[s.targetName, { color: C.text }]} numberOfLines={1}>
                    {target.name}
                  </Text>
                  <Text style={[s.targetUni, { color: C.sec }]} numberOfLines={1}>{target.uni}</Text>
                  <View style={s.targetStatus}>
                    <Icon
                      name={reachable ? "check" : "alert"}
                      size={13}
                      color={reachable ? C.green : C.red}
                    />
                    <Text style={[s.targetHint, { color: reachable ? C.green : C.red }]}>
                      {reachable
                        ? `Ulaştın! (kabul ~${fmt(target.rank)})`
                        : `Kabul için ~${fmt(target.rank)} gerek`}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={[s.targetName, { color: C.muted }]}>Bölüm seç</Text>
              )}
            </View>
            <View style={[s.targetIcon, { backgroundColor: C.purple + "1A" }]}>
              <Icon name="chevR" size={18} color={C.purple} />
            </View>
          </View>
        </Pressable>

        {/* === TYT dersleri === */}
        <Text style={[s.sectionTitle, { color: C.muted }]}>TYT NETLERİN</Text>
        {TYT_SUBJECTS.map((subj) => (
          <SubjectRow
            key={subj.key}
            subject={subj}
            values={tytValues[subj.key] || { c: "", w: "" }}
            onChange={(v) => { setTouched(true); setTytValues((prev) => ({ ...prev, [subj.key]: v })); }}
            color={subjectColors[subj.key] || C.purple}
            C={C}
          />
        ))}

        {/* === AYT dersleri === */}
        {type !== "soz" && type !== "ea" && type !== "say" ? null : (
          <>
            <Text style={[s.sectionTitle, { color: C.muted }]}>
              AYT NETLERİN ({type.toUpperCase()})
            </Text>
            {aytSubjects.map((subj) => (
              <SubjectRow
                key={subj.key}
                subject={subj}
                values={aytValues[subj.key] || { c: "", w: "" }}
                onChange={(v) => { setTouched(true); setAytValues((prev) => ({ ...prev, [subj.key]: v })); }}
                color={subjectColors[subj.key] || C.purple}
                C={C}
              />
            ))}
          </>
        )}

        <Text style={[s.disclaimer, { color: C.muted }]}>{RANKING_DISCLAIMER}</Text>
      </ScrollView>

      {/* === Hedef bölüm seçici modal === */}
      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Pressable style={s.backdrop} onPress={() => setPickerOpen(false)}>
            <Pressable style={[s.sheet, { backgroundColor: C.surface }]} onPress={(e) => e.stopPropagation()}>
              <View style={[s.handle, { backgroundColor: C.border }]} />
              <Text style={[s.sheetTitle, { color: C.text }]}>Hedef Bölüm Seç</Text>

              {/* Search */}
              <View style={[s.searchBox, { backgroundColor: C.surface2, borderColor: C.border }]}>
                <Icon name="search" size={16} color={C.muted} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Bölüm veya üniversite ara"
                  placeholderTextColor={C.muted}
                  style={[s.searchInput, { color: C.text }]}
                />
                {query.length > 0 && (
                  <Pressable onPress={() => setQuery("")} hitSlop={8}>
                    <Icon name="x" size={14} color={C.muted} />
                  </Pressable>
                )}
              </View>

              {/* Category chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                <View style={{ flexDirection: "row", gap: 6, paddingRight: 16 }}>
                  <Pressable
                    onPress={() => setCategory(null)}
                    style={[s.catChip, {
                      backgroundColor: !category ? C.purple : C.surface2,
                      borderColor: !category ? C.purple : C.border,
                    }]}
                  >
                    <Text style={[s.catText, { color: !category ? "#FFFFFF" : C.sec }]}>
                      Tümü
                    </Text>
                  </Pressable>
                  {PROGRAM_CATEGORIES.map((cat) => {
                    const active = category === cat.id;
                    const color = C[cat.color] || C.purple;
                    return (
                      <Pressable
                        key={cat.id}
                        onPress={() => setCategory(active ? null : cat.id)}
                        style={[s.catChip, {
                          backgroundColor: active ? color : color + "12",
                          borderColor: active ? color : color + "30",
                        }]}
                      >
                        <Icon name={cat.icon} size={11} color={active ? "#FFFFFF" : color} />
                        <Text style={[s.catText, { color: active ? "#FFFFFF" : color }]}>
                          {cat.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              <FlatList
                data={filteredPrograms}
                keyExtractor={(item) => item.id}
                style={{ marginTop: 8, maxHeight: 380 }}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={() => (
                  <View style={{ padding: 24, alignItems: "center" }}>
                    <Text style={{ color: C.muted }}>Sonuç bulunamadı</Text>
                  </View>
                )}
                renderItem={({ item }) => {
                  const cat = PROGRAM_CATEGORIES.find((x) => x.id === item.category);
                  const color = cat ? (C[cat.color] || C.purple) : C.purple;
                  return (
                    <Pressable onPress={() => selectTarget(item)} style={[s.progRow, { borderBottomColor: C.border }]}>
                      <View style={[s.progIcon, { backgroundColor: color + "1A" }]}>
                        <Icon name={cat?.icon || "target"} size={15} color={color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.progName, { color: C.text }]}>{item.name}</Text>
                        <Text style={[s.progUni, { color: C.muted }]}>{item.uni}</Text>
                      </View>
                      <Text style={[s.progRank, { color: color }]}>~{fmt(item.rank)}</Text>
                    </Pressable>
                  );
                }}
              />
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  title: { ...TYPOGRAPHY.subheading },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },
  rankCard: {
    padding: 22, alignItems: "center",
    borderRadius: 26, borderWidth: 1,
  },
  rankLabel: { ...TYPOGRAPHY.label, letterSpacing: 0.8 },
  rankBig: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 44, marginTop: 6, letterSpacing: -1.5 },
  deltaChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 8 },
  deltaText: { ...TYPOGRAPHY.captionMedium },
  netSummary: { ...TYPOGRAPHY.caption, marginTop: 10 },
  targetCard: {
    flexDirection: "row", alignItems: "center",
    padding: 16, borderRadius: 22, borderWidth: 1,
  },
  targetLabel: { ...TYPOGRAPHY.label, letterSpacing: 0.6 },
  targetName: { ...TYPOGRAPHY.bodySemiBold, marginTop: 4, fontSize: 16 },
  targetUni: { ...TYPOGRAPHY.caption, marginTop: 2 },
  targetStatus: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  targetHint: { ...TYPOGRAPHY.captionMedium },
  targetIcon: { width: 32, height: 32, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  sectionTitle: { ...TYPOGRAPHY.label, marginTop: 24, marginBottom: 10 },
  disclaimer: { ...TYPOGRAPHY.micro, marginTop: SPACING.xl, textAlign: "center", lineHeight: 16 },

  backdrop: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: SPACING.md },
  sheetTitle: { ...TYPOGRAPHY.subheading, marginBottom: 14 },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1,
  },
  searchInput: { ...TYPOGRAPHY.body, flex: 1, paddingVertical: 0 },
  catChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 11, paddingVertical: 6,
    borderRadius: 999, borderWidth: 1,
  },
  catText: { ...TYPOGRAPHY.micro, fontFamily: "Inter_600SemiBold" },
  progRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 12, borderBottomWidth: 1,
  },
  progIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  progName: { ...TYPOGRAPHY.bodyMedium },
  progUni: { ...TYPOGRAPHY.micro, marginTop: 2 },
  progRank: { ...TYPOGRAPHY.bodySemiBold, fontSize: 13 },
});

const srs = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  stripe: { width: 4 },
  body: { flex: 1, padding: 12 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  name: { ...TYPOGRAPHY.bodySemiBold, fontSize: 14, flex: 1 },
  netBadge: {
    fontFamily: "SpaceGrotesk_700Bold", fontSize: 13,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
    overflow: "hidden",
  },
  inputs: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  inputWrap: { width: 64 },
  inputLabel: { ...TYPOGRAPHY.micro, fontFamily: "Inter_600SemiBold", marginBottom: 3, textAlign: "center", letterSpacing: 0.5 },
  input: {
    fontFamily: "SpaceGrotesk_700Bold", fontSize: 18,
    borderRadius: RADIUS.md, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 7,
    textAlign: "center", letterSpacing: -0.3,
  },
  maxLabel: { ...TYPOGRAPHY.caption, marginLeft: 4, marginBottom: 8 },
});
