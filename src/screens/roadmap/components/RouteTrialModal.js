import React, { useMemo, useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CenterCard } from "../../../components/design/CenterCard";
import { Icon } from "../../../components/design/Icon";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP } from "../../../themes/tokens";
import { alpha } from "../../../themes/palette";
import { getSubjectLabel, getSubjectBadge } from "../../../themes/subjects";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { getTrialPublisher } from "../../../hooks/useTrialRecords";
import { getTrialPublishers } from "../../../supabase/productAccess";
import { RouteTrialSubjects } from "./RouteTrialSubjects";
import * as H from "../../../lib/haptics";

const DIFFICULTY_MAP = { easy: "Kolay", standard: "Standart", hard: "Zor", very_hard: "Çok Zor" };

export function RouteTrialModal({ visible, stop, onClose, onNavigateDetail }) {
  const C = useC();
  const [publishers, setPublishers] = useState([]);
  const trial = stop?.trial || null;

  useEffect(() => {
    let cancelled = false;
    getTrialPublishers().then((rows) => {
      if (!cancelled) setPublishers(rows || []);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const publisherMap = useMemo(() => {
    const map = new Map();
    publishers.forEach((p) => { if (p?.id && p?.name) map.set(p.id, p.name); });
    return map;
  }, [publishers]);

  const publisher = trial ? getTrialPublisher(trial, publisherMap) : "";
  const net = trial ? (trial.rawTotalNet ?? trial.totalNet ?? stop?.y ?? 0) : (stop?.y ?? 0);
  const netFormatted = Number(net).toFixed(2).replace(".", ",");
  const dateStr = trial?.date || trial?.trial_date
    ? new Date(trial.date || trial.trial_date).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })
    : stop?.label || "";

  const isBranch = trial?.trialType === "BRANCH";
  const badgeLabel = isBranch
    ? (getSubjectBadge(trial?.branchSubjectName || trial?.branchSubject) || "BR")
    : (trial?.trialType || "TYT");
  const badgeColor = isBranch ? subjectColorOf(C, trial?.branchSubject) : C.accentBright;

  const subjectList = useMemo(() => {
    if (!trial?.subjects) return [];
    return Object.entries(trial.subjects)
      .filter(([_, s]) => s && (s.correct > 0 || s.wrong > 0 || s.net !== 0))
      .map(([key, s]) => ({
        key,
        label: getSubjectLabel(key),
        color: subjectColorOf(C, key),
        net: Number(s.net ?? 0).toFixed(1).replace(".", ","),
        cw: `${s.correct ?? 0}D ${s.wrong ?? 0}Y`,
      }))
      .slice(0, 4);
  }, [trial?.subjects, C]);

  const handleGoDetail = useCallback(() => {
    H.select();
    onClose?.();
    if (trial) onNavigateDetail?.(trial);
  }, [trial, onClose, onNavigateDetail]);

  if (!stop) return null;

  return (
    <CenterCard visible={visible} onClose={onClose}>
      <View style={s.content}>
        <View style={s.header}>
          <View style={[s.badge, { backgroundColor: alpha(badgeColor, 12), borderColor: alpha(badgeColor, 35) }]}>
            <Text style={[s.badgeText, { color: badgeColor }]}>{badgeLabel.toUpperCase()}</Text>
          </View>
          <Text style={[s.date, { color: C.text3 }]}>{dateStr}</Text>
          <Press hitSlop={12} onPress={onClose} style={s.closeBtn}>
            <Icon name="x" size={16} color={C.text3} />
          </Press>
        </View>

        <View style={s.titleBlock}>
          <Text style={[s.pubTitle, { color: C.text }]} numberOfLines={1}>
            {publisher || trial?.name || trial?.title || `${badgeLabel} Denemesi`}
          </Text>
          {publisher && (trial?.title || trial?.name) && trial.title !== publisher && trial.name !== publisher ? (
            <Text style={[s.subTitle, { color: C.text3 }]} numberOfLines={1}>{trial.title || trial.name}</Text>
          ) : null}
        </View>

        <View style={[s.netBox, { backgroundColor: C.elev, borderColor: C.line }]}>
          <View style={s.netRow}>
            <Text style={[s.netVal, { color: C.text }]}>{netFormatted}</Text>
            <Text style={[s.netUnit, { color: C.text3 }]}>NET</Text>
          </View>
          <View style={s.metaChips}>
            {trial?.durationMinutes ? (
              <View style={[s.chip, { backgroundColor: C.surface, borderColor: C.line }]}>
                <Text style={[s.chipText, { color: C.text2 }]}>{trial.durationMinutes} dk</Text>
              </View>
            ) : null}
            {trial?.difficultyLevel && DIFFICULTY_MAP[trial.difficultyLevel] ? (
              <View style={[s.chip, { backgroundColor: C.surface, borderColor: C.line }]}>
                <Text style={[s.chipText, { color: C.text2 }]}>{DIFFICULTY_MAP[trial.difficultyLevel]}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <RouteTrialSubjects subjectList={subjectList} C={C} />

        <Press
          haptic="none"
          onPress={handleGoDetail}
          style={[s.btn, { backgroundColor: C.brandFill || C.accent }]}
        >
          <Text style={s.btnText}>Deneme Detayına Git</Text>
          <Icon name="arrowR" size={15} color="#FFFFFF" />
        </Press>
      </View>
    </CenterCard>
  );
}

const s = StyleSheet.create({
  content: { padding: STEP.s3 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { height: 22, paddingHorizontal: 8, borderRadius: SHAPE.chip, borderWidth: 1, justifyContent: "center" },
  badgeText: { fontFamily: "Archivo_700", fontSize: 11, letterSpacing: 1.1 },
  date: { fontFamily: "Archivo_500", fontSize: 12, flex: 1, marginLeft: 10 },
  closeBtn: { padding: 4 },
  titleBlock: { marginTop: 12 },
  pubTitle: { fontFamily: "Archivo_600", fontSize: 18, letterSpacing: -0.2 },
  subTitle: { fontFamily: "Archivo_500", fontSize: 12.5, marginTop: 2 },
  netBox: { marginTop: 14, padding: 12, borderRadius: 12, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  netRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  netVal: { fontFamily: "Bricolage_400", fontSize: 32, fontVariant: ["tabular-nums"] },
  netUnit: { fontFamily: "Archivo_700", fontSize: 11, letterSpacing: 1.2 },
  metaChips: { flexDirection: "row", gap: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  chipText: { fontFamily: "Archivo_500", fontSize: 11 },
  btn: { marginTop: 18, height: 48, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnText: { fontFamily: "Archivo_700", fontSize: 14.5, color: "#FFFFFF" },
});
