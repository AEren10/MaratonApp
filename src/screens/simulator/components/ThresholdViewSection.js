import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { Card, Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { getProgramsNearNet, PROGRAMS_DISCLAIMER } from "../../../data/programs";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { ThresholdContributorRow } from "./ThresholdContributorRow";
import { ThresholdDepartmentCard } from "./ThresholdDepartmentCard";

export const ThresholdViewSection = memo(function ThresholdViewSection({
  targetNet,
  examLabel,
  currentNet,
  daysUntilExam,
  gapResult,
  canAccess,
  requestAccess,
  examType,
}) {
  const C = useC();

  const bandPrograms = useMemo(() => {
    return getProgramsNearNet({
      net: targetNet,
      examType: examType === "tyt" ? "tyt" : "ayt",
      tolerance: 10,
      limit: 5,
    });
  }, [targetNet, examType]);

  return (
    <View>
      <Animated.View style={s.headWrap}>
        <View style={s.eyebrowRow}>
          <View style={[s.targetPill, { backgroundColor: C.elev, borderColor: C.line }]}>
            <View style={[s.pulseDot, { backgroundColor: C.accentBright }]} />
            <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>{examLabel || "HEDEF EŞİĞİ"}</Text>
          </View>
        </View>

        <Text style={[TYPOGRAPHY.heading, { color: C.text, maxWidth: 320, marginTop: STEP.s1 }]}>
          <Text style={{ color: C.accentBright }}>{Math.round(targetNet)} net</Text> nereye yeter?
        </Text>

        <Text style={[TYPOGRAPHY.body, { color: C.text3, marginTop: STEP.s1, maxWidth: 340 }]}>
          {gapResult?.reached ? (
            `Şu an ${currentNet.toFixed(1)} nettesin, hedefi zaten geçtin.`
          ) : (
            <>
              {"Şu an "}
              <Text style={{ color: C.text, fontFamily: "Archivo_600" }}>{currentNet.toFixed(1)} net</Text>
              {", hedefe "}
              <Text style={{ color: C.accentBright, fontFamily: "Archivo_600" }}>{gapResult?.gap ?? 0} net</Text>
              {" kaldı"}
              {daysUntilExam ? ` · ${daysUntilExam} gün.` : "."}
            </>
          )}
        </Text>
      </Animated.View>

      {bandPrograms.length > 0 ? (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>
              BANDIN İÇİNDEKİ BÖLÜMLER
            </Text>
            <View style={[s.countBadge, { backgroundColor: C.elev, borderColor: C.line }]}>
              <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{bandPrograms.length} BÖLÜM</Text>
            </View>
          </View>
          <View style={s.list}>
            {bandPrograms.map((prog) => (
              <ThresholdDepartmentCard key={prog.id} program={prog} />
            ))}
          </View>
        </View>
      ) : null}

      {!gapResult?.reached && gapResult?.topContributors?.length > 0 ? (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.titleWithIcon}>
              <Icon name="trendUp" size={13} color={C.up} />
              <Text style={[TYPOGRAPHY.label, { color: C.up, letterSpacing: 1 }]}>
                AÇIĞI KAPATAN KONULAR
              </Text>
            </View>
            <View style={[s.gainHeaderBadge, { backgroundColor: C.up + "15", borderColor: C.up + "30" }]}>
              <Text style={[TYPOGRAPHY.micro, { color: C.up }]}>YÜKSEK GETİRİ</Text>
            </View>
          </View>
          <View style={s.list}>
            {gapResult.topContributors.slice(0, 6).map((item) => (
              <ThresholdContributorRow key={`${item.subject}-${item.topic}`} item={item} locked={!canAccess} />
            ))}
          </View>
          {!canAccess ? (
            <Press haptic="none" onPress={requestAccess} accessibilityRole="button" accessibilityLabel="Kilidi aç" style={s.unlockBtn}>
              <Text style={[TYPOGRAPHY.captionMedium, { color: C.accentText, textAlign: "center" }]}>
                Kilidi açmak için dokun
              </Text>
            </Press>
          ) : null}
        </View>
      ) : null}

      {!gapResult?.reached && gapResult && !gapResult.reachable ? (
        <Card tone="surface" radius="panel" style={[s.warnCard, { borderColor: C.warn }]}>
          <Text style={[TYPOGRAPHY.caption, { color: C.warn }]}>
            Tüm konular ustalaşılsa bile ulaşılabilir en yüksek net ~{Math.round(currentNet + gapResult.maxPossibleNet)}.
            Hedef netini gözden geçirmek isteyebilirsin.
          </Text>
        </Card>
      ) : null}

      <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s4, textAlign: "center" }]}>
        {PROGRAMS_DISCLAIMER}
      </Text>
    </View>
  );
});

const s = StyleSheet.create({
  headWrap: { marginTop: STEP.s2 },
  eyebrowRow: { flexDirection: "row", alignItems: "center" },
  targetPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3 },
  section: { marginTop: STEP.s4 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: STEP.s2,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  titleWithIcon: { flexDirection: "row", alignItems: "center", gap: 6 },
  gainHeaderBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  list: { gap: STEP.s1 },
  unlockBtn: { marginTop: STEP.s2, minHeight: 44, justifyContent: "center" },
  warnCard: { marginTop: STEP.s3 },
});
