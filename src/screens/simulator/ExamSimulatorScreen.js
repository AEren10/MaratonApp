import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { useAuth } from "../../contexts/AuthContext";
import * as haptic from "../../lib/haptics";
import { useAlert } from "../../contexts/AlertContext";
import { addStudyLog } from "../../supabase/studyLogs";
import { SCREENS } from "../../constants/screens";
import { todayTR } from "../../lib/dateUtils";

const TYT_CONFIG = { time: 165, label: "TYT", sections: ["turkce", "sosyal", "matematik", "fen"] };
const AYT_CONFIG = { time: 180, label: "AYT", sections: ["mat", "fizik", "kimya", "biyoloji", "edebiyat", "tarih1", "cografya1"] };
const LGS_CONFIG = { time: 155, label: "LGS", sections: ["turkce", "matematik", "fen", "inkilap", "din", "ingilizce"] };

export default function ExamSimulatorScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const { examType } = useExam();
  const { user } = useAuth();
  const showAlert = useAlert();

  const [phase, setPhase] = useState("setup");
  const [config, setConfig] = useState(
    examType === "lgs" ? LGS_CONFIG : examType === "ayt" ? AYT_CONFIG : TYT_CONFIG
  );
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const savedRef = useRef(false);

  const startExam = useCallback(() => {
    setPhase("running");
    setElapsed(0);
    setPaused(false);
  }, []);

  useEffect(() => {
    if (phase !== "running" || paused) return;
    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= config.time * 60) {
          clearInterval(timerRef.current);
          haptic.success();
          setPhase("done");
          return config.time * 60;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, paused, config.time]);

  const finishEarly = useCallback(() => {
    haptic.warn();
    showAlert("Bitir", "Simülasyonu bitirmek istiyor musun?", [
      { text: "İptal", style: "cancel" },
      { text: "Bitir", onPress: () => { clearInterval(timerRef.current); setPhase("done"); haptic.success(); } },
    ]);
  }, []);

  const togglePause = useCallback(() => setPaused((p) => !p), []);

  useEffect(() => {
    if (phase !== "done" || savedRef.current) return;
    savedRef.current = true;
    if (user?.id && user.id !== "dev") {
      addStudyLog({
        user_id: user.id,
        subject: config.label,
        topic: "Sınav Simülasyonu",
        question_count: 0,
        correct_count: 0,
        duration_minutes: Math.max(1, Math.ceil(elapsed / 60)),
        study_date: todayTR(),
      }).catch(() => {});
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const remaining = config.time * 60 - elapsed;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = elapsed / (config.time * 60);
  const urgency = remaining <= 600 ? C.red : remaining <= 1800 ? C.amber : C.green;

  if (phase === "setup") {
    return (
      <SafeAreaView edges={["top"]} style={s.safe}>
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}><Icon name="arrowL" size={20} color={C.text} /></Pressable>
          <Text style={s.title}>Sınav Simülasyonu</Text>
          <View style={{ width: 20 }} />
        </View>
        <View style={s.setupBody}>
          <Animated.View entering={FadeInDown}>
            <Icon name="clock" size={48} color={C.accent} />
          </Animated.View>
          <Text style={s.setupTitle}>Gerçek sınav koşullarında çalış</Text>
          <Text style={s.setupSub}>Zamanlayıcı sınavdaki süreyi simüle eder. Kendi kitapçığınla çöz, süreyi buradan takip et.</Text>
          <View style={[s.configRow, examType === "lgs" && { justifyContent: "center" }]}>
            {(examType === "lgs" ? [LGS_CONFIG] : [TYT_CONFIG, AYT_CONFIG]).map((cfg) => (
              <Pressable key={cfg.label} onPress={() => setConfig(cfg)}
                style={[s.configBtn, examType === "lgs" && { flex: 0, minWidth: 140 }, config.label === cfg.label && { borderColor: C.accent, backgroundColor: C.accent + "12" }]}>
                <Text style={[s.configText, config.label === cfg.label && { color: C.accent }]}>{cfg.label}</Text>
                <Text style={s.configMeta}>{cfg.time} dk</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={startExam} style={s.cta}>
            <Icon name="play" size={18} color="#FFFFFF" />
            <Text style={s.ctaText}>Başla</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === "done") {
    const usedMins = Math.floor(elapsed / 60);
    const timeOut = elapsed >= config.time * 60;
    return (
      <SafeAreaView edges={["top"]} style={s.safe}>
        <View style={s.center}>
          <Animated.View entering={ZoomIn}><Icon name="checkCircle" size={56} color={C.green} /></Animated.View>
          <Text style={s.doneTitle}>Simülasyon Tamamlandı!</Text>
          <Text style={s.doneStat}>{usedMins} dk {elapsed % 60} sn</Text>
          <Text style={s.doneSub}>{timeOut ? "Süre doldu!" : "Erken bitirdin"}</Text>
          <Pressable
            onPress={() => { haptic.select(); navigation.replace(SCREENS.TRIAL_ENTRY); }}
            style={s.cta}
          >
            <Icon name="chart" size={18} color="#FFFFFF" />
            <Text style={s.ctaText}>Sonuçlarını Gir</Text>
          </Pressable>
          <Pressable onPress={() => navigation.goBack()} style={s.secondaryBtn}>
            <Text style={[s.doneSub, { color: C.sec }]}>Kapat</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <View style={[s.typeBadge, { backgroundColor: C.amber + "18" }]}>
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.amber }}>{config.label}</Text>
        </View>
        <Text style={s.title}>Simülasyon</Text>
        <Pressable onPress={finishEarly} hitSlop={12}><Icon name="x" size={20} color={C.red} /></Pressable>
      </View>

      <View style={s.timerArea}>
        <Text style={[s.timerText, { color: urgency }]}>
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </Text>
        <Text style={s.timerSub}>kalan süre</Text>
        <View style={s.barBg}><View style={[s.barFill, { width: `${pct * 100}%`, backgroundColor: urgency }]} /></View>
      </View>

      <View style={s.controls}>
        <Pressable onPress={togglePause} style={[s.controlBtn, { backgroundColor: (paused ? C.green : C.accent) + "18" }]}>
          <Icon name={paused ? "play" : "pause"} size={22} color={paused ? C.green : C.accent} />
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: paused ? C.green : C.accent }}>{paused ? "Devam" : "Duraklat"}</Text>
        </Pressable>
        <Pressable onPress={finishEarly} style={[s.controlBtn, { backgroundColor: C.red + "18" }]}>
          <Icon name="check" size={22} color={C.red} />
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.red }}>Bitir</Text>
        </Pressable>
      </View>

      {paused && (
        <Animated.View entering={FadeInDown} style={s.pauseBanner}>
          <Icon name="pause" size={16} color={C.accent} />
          <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.accent }}>Duraklatıldı</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.xl, gap: SPACING.md },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    title: { ...TYPOGRAPHY.subheading, color: C.text },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    setupBody: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.xl, gap: SPACING.lg },
    setupTitle: { ...TYPOGRAPHY.subheading, color: C.text, textAlign: "center" },
    setupSub: { ...TYPOGRAPHY.body, color: C.sec, textAlign: "center" },
    configRow: { flexDirection: "row", gap: SPACING.md },
    configBtn: { flex: 1, alignItems: "center", padding: SPACING.lg, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
    configText: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
    configMeta: { ...TYPOGRAPHY.micro, color: C.muted, marginTop: 2 },
    cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm, backgroundColor: C.accent, borderRadius: RADIUS.xl, paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxxl },
    ctaText: { ...TYPOGRAPHY.button, color: "#FFFFFF" },
    timerArea: { alignItems: "center", paddingVertical: SPACING.xxxl, gap: SPACING.sm },
    timerText: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 64 },
    timerSub: { ...TYPOGRAPHY.caption, color: C.muted },
    barBg: { width: "80%", height: 4, borderRadius: 2, backgroundColor: C.surface2, marginTop: SPACING.md },
    barFill: { height: 4, borderRadius: 2 },
    controls: { flexDirection: "row", gap: SPACING.lg, justifyContent: "center", paddingHorizontal: SPACING.xl },
    controlBtn: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.xl },
    pauseBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm, paddingVertical: SPACING.lg, marginTop: SPACING.xl },
    doneTitle: { ...TYPOGRAPHY.subheading, color: C.text },
    doneStat: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 36, color: C.green },
    doneSub: { ...TYPOGRAPHY.caption, color: C.muted },
    secondaryBtn: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl },
  });
}
