import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated from "react-native-reanimated";

import { Button, Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { SCREENS } from "../../constants/screens";
import { TAB_KEYS } from "../../navigation/tabAssignment";
import { openInTab } from "../../navigation/tabJump";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import * as H from "../../lib/haptics";
import { trialShortLabel } from "./trialLabels";
import { useTrialSummary } from "./useTrialSummary";
import { useTrialSummaryShare } from "./useTrialSummaryShare";
import { TrialShareCard } from "./components/TrialShareCard";
import { TrialSummaryHero } from "./components/TrialSummaryHero";
import { TrialSummaryRouteLine } from "./components/TrialSummaryRouteLine";
import { TrialSummarySubjectDeltas } from "./components/TrialSummarySubjectDeltas";
import { TrialSummaryTarget } from "./components/TrialSummaryTarget";
import { TrialDropLayout } from "./components/TrialDropLayout";
import { Press } from "../../components/design/Press";

// Deneme Ozeti: kayit sonrasi ekran. Imza ani rota cizgisinde.
export default function TrialSummaryScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const cardRef = useRef(null);
  const trial = route.params?.trial;
  const summary = useTrialSummary({ trial, C });
  const handleShare = useTrialSummaryShare(cardRef);

  useEffect(() => { if (trial) H.success(); else navigation.goBack(); }, [trial, navigation]);

  if (!trial || !summary) return null;

  const typeLabel = trialShortLabel(trial.trialType, trial.name || "Deneme");
  const date = trial.date ? new Date(trial.date) : null;
  const dayMonth = date ? date.toLocaleDateString("tr-TR", { day: "numeric", month: "long" }) : "";
  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Öğrenci";

  // NEGATIF RETENTION DURUMU (ZOR DENEME)
  const isDrop = summary.delta != null && summary.delta < 0;

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      {isDrop ? (
        <TrialDropLayout trial={trial} summary={summary} typeLabel={typeLabel} dayMonth={dayMonth} onShare={handleShare} />
      ) : (
        <>
          <View style={styles.header}>
            <Press haptic="none" onPress={() => navigation.popToTop()} style={styles.close}
              accessibilityLabel="Kapat" accessibilityRole="button">
              <Icon name="x" size={14} color={C.text2} sw={1.7} />
            </Press>
            <Text style={[TYPOGRAPHY.label, styles.headerLabel, { color: C.text3 }]}>
              {[typeLabel, dayMonth].filter(Boolean).join(" · ").toLocaleUpperCase("tr-TR")}
            </Text>
            <Press haptic="none" onPress={handleShare} style={styles.close}
              accessibilityLabel="Paylaş" accessibilityRole="button">
              <Icon name="share" size={16} color={C.text2} />
            </Press>
          </View>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <TrialSummaryHero typeLabel={typeLabel} net={trial.totalNet} prevNet={summary.prevNet} delta={summary.delta} />
            {summary.hasChart ? (
              <Animated.View style={styles.chart}>
                <TrialSummaryRouteLine route={summary.route} />
              </Animated.View>
            ) : null}
            {summary.sentence ? (
              <Animated.View style={styles.section}>
                <View style={[styles.sentence, { backgroundColor: C.surface, borderColor: C.elev }]}>
                  <Text style={[TYPOGRAPHY.topicName, { color: C.text }]}>{summary.sentence}</Text>
                </View>
              </Animated.View>
            ) : null}
            <TrialSummarySubjectDeltas bars={summary.bars} />
            <TrialSummaryTarget onDepartments={() => openInTab(navigation, TAB_KEYS.PROFIL, SCREENS.GOALS)} />
            {/* Kayit bitti: bir sonraki dogal adim yanlislari deftere eklemek.
                Yoksa kullanici denemeyi girdigi yere doner. Eskiden ana buton
                "Deneme kayitlarini gor" idi ve Analiz sekmesindeki genel
                listeye atiyordu; kayitlar Analiz'de duruyor. */}
            <Animated.View style={styles.actions}>
              {summary.totalWrong > 0 ? (
                <Button size="lg" fullWidth onPress={() => navigation.navigate(SCREENS.ADD_WRONG)}>
                  Yanlışları deftere ekle
                </Button>
              ) : null}
              <Button
                size="lg"
                fullWidth
                variant={summary.totalWrong > 0 ? "outline" : "primary"}
                onPress={() => navigation.popToTop()}
                style={summary.totalWrong > 0 ? { marginTop: STEP.s2 } : undefined}
              >
                Tamam
              </Button>
            </Animated.View>
          </ScrollView>
        </>
      )}
      <View style={styles.offscreen} pointerEvents="none">
        <TrialShareCard ref={cardRef} typeName={summary.typeName} trialTitle={trial.name}
          net={trial.totalNet || 0} dateStr={date ? date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : ""}
          bars={summary.bars} trend={summary.delta || 0} userName={displayName} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: STEP.s1, paddingHorizontal: GUTTER - STEP.s2, paddingTop: 4 },
  close: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  headerLabel: { flex: 1, fontFamily: "Archivo_700", fontSize: 13, lineHeight: 18, letterSpacing: 2.4 },
  scroll: { paddingBottom: STEP.s4 + STEP.s1 },
  chart: { marginTop: STEP.s3 + 4 },
  section: { paddingHorizontal: GUTTER, marginTop: STEP.s2 + 2 },
  sentence: { paddingVertical: STEP.s3 - 2, paddingHorizontal: STEP.s3, borderRadius: SHAPE.card + 2, borderWidth: 1 },
  actions: { paddingHorizontal: GUTTER, marginTop: STEP.s4 - 6 },
  offscreen: { position: "absolute", top: -9999, left: -9999 },
});
