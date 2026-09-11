import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExam } from "../../contexts/ExamContext";
import { Icon, Button } from "../../components/design";
import { SettingsGroup } from "./components/SettingsGroup";
import { SettingsRow } from "./components/SettingsRow";
import { GoalNetStepper } from "./components/GoalNetStepper";
import { GoalBandNote } from "./components/GoalBandNote";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useGoalNetEditor } from "../../hooks/useGoalNetEditor";

// Tasarim: "Hedef Duzenle" artboard'i — Ayarlar > Hedef net satirindan
// acilan duzenleyici.
//
// Tasarim yalniz hedef neti gosteriyor ama gunluk soru hedefi de burada:
// Ayarlar'daki "Gunluk soru hedefi" satiri bu ekrana geliyor ve tek alana
// indirmek o satiri cikmaz sokaga cevirirdi. daily_question_goal gercek ve
// yazilabilir bir kolon, ustelik rotanin kapasite girdisi.
//
// Sinav tarihi dokunulamaz kaliyor: duzenlemek icin Tarih Secici ekrani
// gerekiyor ve o henuz yok -- var olmayan bir akisi uydurmamak icin.
export default function GoalsScreen() {
  const C = useC();
  const { examDate } = useExam();
  const {
    value, dec, inc, save, cancel, saving, pendingNote,
    netLabel, currentNet, gapResult, targetDepartment, min, max,
    daily, decDaily, incDaily, dailyMin, dailyMax,
  } = useGoalNetEditor();

  const examDateLabel = examDate
    ? examDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={cancel} hitSlop={12} accessibilityRole="button" accessibilityLabel="Kapat" style={styles.closeBtn}>
          <Icon name="x" size={14} color={C.text2} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>Hedef net</Text>
        <Text style={[TYPOGRAPHY.body, { color: C.text3, marginTop: STEP.s1 }]}>
          Rota bu sayıya göre çizilir. Değiştirince haftalık yük yeniden hesaplanır.
        </Text>

        <GoalNetStepper
          value={value} min={min} max={max} netLabel={netLabel}
          currentNet={currentNet} onDec={dec} onInc={inc}
        />

        <GoalBandNote value={value} targetDepartment={targetDepartment} gapResult={gapResult} />

        <Text style={[TYPOGRAPHY.label, styles.section, { color: C.text2 }]}>
          GÜNLÜK SORU HEDEFİ
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>
          Rotanın haftalık kapasitesi bu sayıdan hesaplanır.
        </Text>
        <GoalNetStepper
          value={daily}
          min={dailyMin}
          max={dailyMax}
          unit="soru · günde"
          label="günlük soru hedefini"
          currentNet={null}
          onDec={decDaily}
          onInc={incDaily}
        />

        <SettingsGroup title="Aynı ekrandan">
          <SettingsRow first label="Sınav tarihi" value={examDateLabel} />
        </SettingsGroup>
      </ScrollView>

      <View style={[styles.cta, { borderTopColor: C.line }]}>
        <Button onPress={save} size="lg" fullWidth loading={saving}>
          Kaydet
        </Button>
        <Pressable onPress={cancel} style={styles.cancelBtn} accessibilityRole="button">
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>Vazgeç</Text>
        </Pressable>
        {pendingNote ? (
          <Text style={[TYPOGRAPHY.micro, styles.pendingNote, { color: C.text3 }]}>{pendingNote}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:      { flexDirection: "row", alignItems: "center", paddingHorizontal: STEP.s3, paddingTop: STEP.s1 },
  closeBtn:    { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginLeft: -STEP.s2 },
  scroll:      { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s3 },
  cta:         { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: STEP.s2, borderTopWidth: 1 },
  section:     { marginTop: STEP.s5, marginBottom: STEP.s1 },
  cancelBtn:   { height: 44, alignItems: "center", justifyContent: "center", marginTop: STEP.s1 },
  pendingNote: { marginTop: STEP.s1, textAlign: "center" },
});
