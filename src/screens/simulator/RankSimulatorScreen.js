import { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Icon, Skeleton } from "../../components/design";
import { EmptyState } from "../../components/design/EmptyState";
import { GUTTER, STEP, TYPOGRAPHY, SHAPE, NAV_ICON } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useThresholdView } from "../../hooks/useThresholdView";
import { useExam } from "../../contexts/ExamContext";
import { Press } from "../../components/design/Press";
import { SimulatorSegment } from "./components/SimulatorSegment";
import { ThresholdViewSection } from "./components/ThresholdViewSection";
import { PreferenceListSection } from "./components/PreferenceListSection";

function emptyCopy({ targetNet, examLabel, multi }) {
  const exam = examLabel || "deneme";
  if (targetNet == null) {
    return {
      title: `${examLabel ? `${examLabel} hedefin` : "Hedef netin"} eksik`,
      body: multi
        ? "Hedeflerim'de iki sınavın netini ayrı ayrı gir; açığı ve bölümleri burada göreceksin."
        : "Hedef netini Hedeflerim'den gir; açığı ve bölümleri burada göreceksin.",
      primary: "Hedef Belirle",
    };
  }
  return {
    title: `Önce bir ${exam} denemesi gir`,
    body: `Hedefin ${Math.round(targetNet)} net. Son denemenle arasındaki açığı ve sana denk gelen bölümleri burada göreceksin.`,
    primary: "Deneme Gir",
  };
}

export default function RankSimulatorScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const C = useC();
  const { examType } = useExam();
  const { targetNet, examLabel, currentNet, daysUntilExam, gapResult, canAccess, requestAccess, loading } = useThresholdView();

  const initialTab = route?.params?.tab === "preference" ? "preference" : "threshold";
  const [activeTab, setActiveTab] = useState(initialTab);

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
        <Header onBack={navigation.goBack} C={C} />
        <View style={s.skelWrap}>
          <Skeleton width="100%" height={40} radius={SHAPE.button} />
          <Skeleton width="100%" height={72} radius={SHAPE.panel} style={s.skelGap} />
          <Skeleton width="100%" height={72} radius={SHAPE.panel} />
          <Skeleton width="100%" height={72} radius={SHAPE.panel} />
        </View>
      </SafeAreaView>
    );
  }

  const isThresholdEmpty = activeTab === "threshold" && (targetNet == null || currentNet == null);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <Header onBack={navigation.goBack} C={C} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <SimulatorSegment activeTab={activeTab} onSelectTab={setActiveTab} />

        {isThresholdEmpty ? (
          <EmptyState
            eyebrow="NET EŞİĞİ"
            {...emptyCopy({ targetNet, examLabel, multi: examType === "tyt_ayt" || examType === "dil" })}
            onPrimary={() => navigation.navigate(targetNet == null ? SCREENS.GOALS : SCREENS.TRIAL_ENTRY)}
            style={s.emptyState}
          />
        ) : activeTab === "threshold" ? (
          <ThresholdViewSection
            targetNet={targetNet}
            examLabel={examLabel}
            currentNet={currentNet}
            daysUntilExam={daysUntilExam}
            gapResult={gapResult}
            canAccess={canAccess}
            requestAccess={requestAccess}
            examType={examType}
          />
        ) : (
          <PreferenceListSection
            initialTyt={currentNet ? Math.min(120, Math.round(currentNet)) : 70}
            initialAyt={targetNet ? Math.min(80, Math.max(20, Math.round(targetNet * 0.6))) : 45}
            initialType={examType === "dil" ? "dil" : "say"}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onBack, C }) {
  return (
    <View style={s.header}>
      <Press haptic="none" onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" style={s.backBtn}>
        <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
      </Press>
      <Text style={[TYPOGRAPHY.label, { color: C.text3, marginLeft: STEP.s1 }]}>NET & SIRALAMA EŞİĞİ</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s2 },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: "center" },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: STEP.s5 },
  skelWrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, gap: STEP.s2 },
  skelGap: { marginTop: STEP.s2 },
  emptyState: { marginTop: STEP.s3 },
});
