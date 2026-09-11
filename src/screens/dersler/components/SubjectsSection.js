import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SCREENS } from "../../../constants/screens";
import { Icon, SectionLabel } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, STEP } from "../../../themes/tokens";
import { useC, useTheme } from "../../../contexts/ThemeContext";
import { useCurriculum } from "../../../hooks/useCurriculum";
import { useDerslerProgress } from "../../../hooks/useDerslerProgress";
import { SkeletonCard } from "../../../components/common/SkeletonCard";
import { FocusCard } from "./FocusCard";
import { SubjectRow } from "./SubjectRow";

// Konu-kapsam ilerlemesi (mufredattaki hangi konular calisildi) — tasarimin
// Program Hub artboard'unda karsiligi yok. Baska bir ekrana tasinmadigi
// icin mevcut davranis Program Hub'in altinda korunuyor.
export function SubjectsSection() {
  const C = useC();
  const { subject: subjectId } = useTheme();
  const navigation = useNavigation();
  const { tytSubjects, aytSubjects, loading, group1Label, group2Label } = useCurriculum();
  const [activeTab, setActiveTab] = useState("tyt");
  const hasAyt = aytSubjects.length > 0;
  const activeList = useMemo(
    () => (activeTab === "tyt" ? tytSubjects : aytSubjects),
    [activeTab, tytSubjects, aytSubjects],
  );
  const { dersler, focusSubject } = useDerslerProgress(activeList);

  if (loading) {
    return (
      <View style={{ gap: SPACING.md, marginTop: STEP.s4 }}>
        <SkeletonCard height={44} rounded={12} />
        <SkeletonCard height={120} rounded={22} />
        <SkeletonCard height={56} rounded={0} />
        <SkeletonCard height={56} rounded={0} />
      </View>
    );
  }

  return (
    <View style={{ marginTop: STEP.s4 }}>
      <SectionLabel>Tüm Dersler</SectionLabel>

      {hasAyt && (
        <View style={{ flexDirection: "row", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.md, padding: 4, marginBottom: SPACING.lg }}>
          {[{ key: "tyt", label: group1Label }, { key: "ayt", label: group2Label }].map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{ flex: 1, borderRadius: RADIUS.sm, paddingVertical: 10, alignItems: "center", backgroundColor: activeTab === tab.key ? C.accent : "transparent" }}
            >
              <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: activeTab === tab.key ? C.textOnFill : C.sec }}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {dersler.length === 0 ? (
        <Pressable
          onPress={() => navigation.navigate(SCREENS.TRIAL_ENTRY)}
          style={{ alignItems: "center", paddingVertical: SPACING.xl, gap: SPACING.sm }}
        >
          <Icon name="bookOpen" size={28} color={C.muted} />
          <Text style={{ ...TYPOGRAPHY.body, color: C.muted, textAlign: "center" }}>
            İlk denemeni girdiğinde konu ilerlemen burada belirir.
          </Text>
        </Pressable>
      ) : (
        <>
          {focusSubject && (
            <View style={{ marginBottom: SPACING.xl }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.md }}>
                <Icon name="alert" size={14} color={C.warn} />
                <Text style={{ fontFamily: "Archivo_600", fontSize: 11, lineHeight: 14, letterSpacing: 1, color: C.warn, textTransform: "uppercase" }}>
                  Önce Buna Odaklan
                </Text>
              </View>
              <FocusCard
                subject={focusSubject}
                identity={subjectId(focusSubject.key)}
                textColor={C.text}
                mutedColor={C.muted}
                surface2Color={C.surface2}
                onPress={() => navigation.navigate(SCREENS.TOPIC_STUDY, { subjectKey: focusSubject.key })}
              />
            </View>
          )}
          <View>
            {dersler.map((subject, i) => (
              <SubjectRow
                key={subject.key}
                subject={subject}
                identity={subjectId(subject.key)}
                textColor={C.text}
                mutedColor={C.muted}
                surface2Color={C.surface2}
                isLast={i === dersler.length - 1}
                onPress={() => navigation.navigate(SCREENS.TOPIC_STUDY, { subjectKey: subject.key })}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}
