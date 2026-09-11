import { useCallback, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useAuth } from "../../contexts/AuthContext";
import { usePremium } from "../../contexts/PremiumContext";

import { SettingsGroup } from "./components/SettingsGroup";
import { SettingsRow } from "./components/SettingsRow";
import { SyncStatusGroup } from "./components/SyncStatusGroup";
import { useSettingsActions } from "./useSettingsActions";
import * as H from "../../lib/haptics";
import { isHapticEnabled, setHapticEnabled } from "../../lib/haptics";
import { useExam } from "../../contexts/ExamContext";
import { useTheme } from "../../contexts/ThemeContext";
import { displayNameOf } from "../../lib/displayName";
import { useSelector } from "react-redux";
import { selectGoals } from "../../store/slices/goalsSlice";
import appConfig from "../../../app.json";

const EXAM_LABELS = { tyt: "TYT", tyt_ayt: "TYT + AYT", dil: "TYT + YDT", lgs: "LGS" };
const FIELD_LABELS = { sayisal: "Sayısal", ea: "Eşit Ağırlık", sozel: "Sözel", dil: "Dil" };
const THEME_LABELS = { dark: "Koyu", light: "Açık", system: "Sistem" };

export default function SettingsScreen() {
  const navigation = useNavigation();
  const C = useC();
  const { handleHelp, handleLogout, handleDeleteAccount } = useSettingsActions();
  const { checkFeature, showPaywall } = usePremium();
  const { examType, field, examDate, targetNet } = useExam();
  const { pref } = useTheme();
  const goals = useSelector(selectGoals);
  const [hapticsOn, setHapticsOn] = useState(isHapticEnabled());
  const { user } = useAuth();

  // Tasarim her satirin sagina GERCEK degeri yaziyor ("20 Haz 2027", "100").
  // Degeri olmayan satirda yalniz chevron kaliyor -- tire/sifir uydurulmuyor.
  const displayName = displayNameOf(user) || "Profilim";
  const examLabel = EXAM_LABELS[examType]
    ? [EXAM_LABELS[examType], FIELD_LABELS[field]].filter(Boolean).join(" · ")
    : null;
  const targetNetLabel = targetNet != null ? String(targetNet) : null;
  const examDateLabel = examDate
    ? examDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })
    : null;
  const dailyGoalLabel = goals?.dailyQuestions ? String(goals.dailyQuestions) : null;
  const themeLabel = THEME_LABELS[pref] || null;
  const appVersion = appConfig?.expo?.version || null;

  const toggleHaptics = useCallback((val) => {
    setHapticsOn(val);
    setHapticEnabled(val);
    if (val) H.tap();
  }, []);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const go = useCallback((s) => () => { H.tap(); navigation.navigate(s); }, [navigation]);

  const gatedGo = useCallback((key, screen) => () => {
    H.tap();
    if (checkFeature(key)) navigation.navigate(screen);
    else showPaywall(`settings_${key}`);
  }, [checkFeature, showPaywall, navigation]);


  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Ayarlar</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profil satiri: tasarim ad + "TYT + AYT Sayisal · 12. sinif" gosteriyor */}
        <Animated.View entering={FadeInDown.duration(420)}>
          <SettingsGroup>
            <SettingsRow
              first
              label={displayName}
              hint={examLabel}
              onPress={go(SCREENS.EDIT_PROFILE)}
            />
          </SettingsGroup>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(420)}>
          <SettingsGroup title="ROTA">
            <SettingsRow first label="Hedef net" value={targetNetLabel} onPress={go(SCREENS.GOALS)} />
            <SettingsRow label="Sınav tarihi" value={examDateLabel} onPress={go(SCREENS.EXAM_DATE)} />
            <SettingsRow label="Günlük soru hedefi" value={dailyGoalLabel} onPress={go(SCREENS.GOALS)} />
            <SettingsRow label="Yol haritası" onPress={go(SCREENS.ROADMAP)} />
            {examType !== "lgs" ? (
              <SettingsRow
                label="Net eşiği"
                hint="Hedef bölüm karşılaştırması"
                onPress={gatedGo("rank_simulator", SCREENS.RANK_SIMULATOR)}
              />
            ) : null}
          </SettingsGroup>
        </Animated.View>

        {/* Tasarimda ayri bir "CALISMA" grubu yok; bu uc ekranin BASKA hicbir
            giris noktasi olmadigi icin burada tutuluyorlar. Kendi akislarinda
            bir giris acilinca bu grup dusurulebilir. */}
        <Animated.View entering={FadeInDown.delay(120).duration(420)}>
          <SettingsGroup title="ÇALIŞMA">
            <SettingsRow first label="Çalışma geçmişi" onPress={go(SCREENS.STUDY_LOG)} />
            <SettingsRow label="Konu kartları" onPress={go(SCREENS.TOPIC_CARDS)} />
            <SettingsRow label="Takvim" onPress={go(SCREENS.CALENDAR)} />
          </SettingsGroup>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(420)}>
          <SettingsGroup title="BİLDİRİMLER">
            <SettingsRow
              first
              label="Bildirimler"
              hint="Durak hatırlatması, günlük tekrar, haftalık rapor"
              onPress={go(SCREENS.NOTIFICATIONS_SETTINGS)}
            />
          </SettingsGroup>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(420)}>
          <SettingsGroup title="UYGULAMA">
            <SettingsRow first label="Görünüm" value={themeLabel} onPress={go(SCREENS.APPEARANCE)} />
            <SettingsRow label="Titreşim" toggle value={hapticsOn} onToggle={toggleHaptics} />
            <SettingsRow label="Gizlilik" onPress={go(SCREENS.PRIVACY)} />
            <SettingsRow label="Kullanım koşulları" onPress={go(SCREENS.TERMS)} />
            <SettingsRow label="Hakkında" onPress={go(SCREENS.ABOUT)} />
            <SettingsRow label="Yardım" hint="destek@maraton.app" onPress={handleHelp} />
          </SettingsGroup>
        </Animated.View>

        {/* Veri yedekleme / cevrimdisi kuyruk ve veri indirme */}
        <Animated.View entering={FadeInDown.delay(300).duration(420)}>
          <SyncStatusGroup />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(360).duration(420)}>
          <SettingsGroup title="HESAP">
            <SettingsRow first label="E-posta değiştir" onPress={go(SCREENS.EDIT_EMAIL)} />
            <SettingsRow label="Şifre değiştir" onPress={go(SCREENS.CHANGE_PASSWORD)} />
            <SettingsRow label="Çıkış yap" danger onPress={handleLogout} />
            <SettingsRow label="Hesabımı sil" danger onPress={handleDeleteAccount} />
          </SettingsGroup>
        </Animated.View>

        {/* Tasarimin Ayarlar ekraninda sosyal satir YOK ve sosyal v1 kapsami
            disi. Ama "Yol Arkadasin" ve "Davet Et" ekranlarinin BASKA hicbir
            giris noktasi yok; satirlari dusurmek onlari erisilemez birakirdi.
            Sosyal v1'den tamamen cikarilirsa bu grup da silinmeli. */}
        <Animated.View entering={FadeInDown.delay(420).duration(420)}>
          <SettingsGroup title="ARKADAŞLAR">
            <SettingsRow first label="Arkadaşlar" onPress={go(SCREENS.FRIENDS)} />
            <SettingsRow label="Yol arkadaşın" onPress={go(SCREENS.ROUTE_COMPANION)} />
            <SettingsRow label="Challenge" onPress={go(SCREENS.CHALLENGE)} />
            <SettingsRow label="Davet et" onPress={go(SCREENS.REFERRAL)} />
          </SettingsGroup>
        </Animated.View>

        <Text style={[TYPOGRAPHY.micro, styles.version, { color: C.text3 }]}>
          {`Maraton ${appVersion}`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
    gap: 14,
  },
  // Gruplar kendi yatay boslugunu tasiyor (SettingsGroup), scroll tasimiyor.
  scroll: { paddingBottom: 60 },
  version: { textAlign: "center", marginTop: STEP.s4 },
});
