import { useCallback, useState, useEffect } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { usePremium } from "../../contexts/PremiumContext";

import { SettingsGroup } from "./components/SettingsGroup";
import { SettingsRow } from "./components/SettingsRow";
import * as H from "../../lib/haptics";
import { isHapticEnabled, setHapticEnabled } from "../../lib/haptics";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const C = useC();
  const { logout, deleteAccount } = useAuth();
  const showAlert = useAlert();
  const { checkFeature, showPaywall } = usePremium();
  const [hapticsOn, setHapticsOn] = useState(isHapticEnabled());

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
    else showPaywall();
  }, [checkFeature, showPaywall, navigation]);

  const handleHelp = useCallback(() => {
    showAlert("Yardım", "Soruların için bize ulaşabilirsin:\n\ndestek@maraton.app");
  }, []);

  const handleLogout = useCallback(() => {
    H.warn();
    showAlert("Çıkış Yap", "Hesabından çıkış yapmak istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: logout },
    ]);
  }, [logout]);

  const handleDeleteAccount = useCallback(() => {
    H.warn();
    showAlert(
      "Hesabını Sil",
      "Hesabın ve tüm verilerin kalıcı olarak silinecek. Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Hesabımı Sil",
          style: "destructive",
          onPress: () => {
            deleteAccount().catch(() =>
              showAlert("Hata", "Hesap silinemedi. Lütfen tekrar dene.")
            );
          },
        },
      ]
    );
  }, [deleteAccount]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>Ayarlar</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* HESAP */}
        <Animated.View entering={FadeInDown.delay(60).duration(400).springify()}>
          <SettingsGroup title="HESAP">
            <SettingsRow icon="user" iconColor={C.blue} label="Profil Düzenle" onPress={go(SCREENS.EDIT_PROFILE)} />
            <SettingsRow icon="mail" iconColor={C.teal} label="E-posta Değiştir" onPress={go(SCREENS.EDIT_EMAIL)} />
            <SettingsRow icon="lock" iconColor={C.amber} label="Şifre Değiştir" onPress={go(SCREENS.CHANGE_PASSWORD)} />
          </SettingsGroup>
        </Animated.View>

        {/* ÇALIŞMA */}
        <Animated.View entering={FadeInDown.delay(120).duration(400).springify()}>
          <SettingsGroup title="ÇALIŞMA">
            <SettingsRow icon="target" iconColor={C.green} label="Hedeflerim" onPress={go(SCREENS.GOALS)} />
            <SettingsRow icon="clock" iconColor={C.blue} label="Çalışma Geçmişi" onPress={go(SCREENS.STUDY_LOG)} />
            <SettingsRow icon="hash" iconColor={C.brandLight} label="Konu Kartları" onPress={go(SCREENS.TOPIC_CARDS)} />
            <SettingsRow icon="chart" iconColor={C.pink} label="Net Simülatörü" onPress={gatedGo("rank_simulator", SCREENS.RANK_SIMULATOR)} />
            <SettingsRow icon="layers" iconColor={C.teal} label="Yol Haritası" onPress={gatedGo("detailed_roadmap", SCREENS.ROADMAP)} />
            <SettingsRow icon="calendar" iconColor={C.amber} label="Takvim" onPress={go(SCREENS.CALENDAR)} />
          </SettingsGroup>
        </Animated.View>

        {/* SOSYAL */}
        <Animated.View entering={FadeInDown.delay(180).duration(400).springify()}>
          <SettingsGroup title="SOSYAL">
            <SettingsRow icon="users" iconColor={C.pink} label="Arkadaşlar" onPress={go(SCREENS.FRIENDS)} />
            <SettingsRow icon="users" iconColor={C.blue} label="Challenge" onPress={go(SCREENS.CHALLENGE)} />
            <SettingsRow icon="mail" iconColor={C.green} label="Davet Et" onPress={go(SCREENS.REFERRAL)} />
          </SettingsGroup>
        </Animated.View>

        {/* TERCİHLER */}
        <Animated.View entering={FadeInDown.delay(240).duration(400).springify()}>
          <SettingsGroup title="TERCİHLER">
            <SettingsRow icon="bell" iconColor={C.accent} label="Bildirimler" onPress={go(SCREENS.NOTIFICATIONS_SETTINGS)} />
            <SettingsRow icon="moon" iconColor={C.accent} label="Görünüm" onPress={go(SCREENS.APPEARANCE)} />
            <SettingsRow icon="zap" iconColor={C.amber} label="Titreşim" toggle value={hapticsOn} onToggle={toggleHaptics} />
          </SettingsGroup>
        </Animated.View>

        {/* UYGULAMA */}
        <Animated.View entering={FadeInDown.delay(300).duration(400).springify()}>
          <SettingsGroup title="UYGULAMA">
            <SettingsRow icon="lock" iconColor={C.blue} label="Gizlilik Politikası" onPress={go(SCREENS.PRIVACY)} />
            <SettingsRow icon="book" iconColor={C.teal} label="Kullanım Koşulları" onPress={go(SCREENS.TERMS)} />
            <SettingsRow icon="info" iconColor={C.green} label="Hakkında" onPress={go(SCREENS.ABOUT)} />
            <SettingsRow icon="share" iconColor={C.accent} label="Yardım" onPress={() => { H.tap(); handleHelp(); }} />
          </SettingsGroup>
        </Animated.View>

        {/* Çıkış */}
        <Animated.View entering={FadeInDown.delay(360).duration(400).springify()}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutBtn,
              { backgroundColor: C.red + "12", borderColor: C.red + "30", opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Icon name="x" size={18} color={C.red} />
            <Text style={[styles.logoutText, { color: C.red }]}>Çıkış Yap</Text>
          </Pressable>
        </Animated.View>

        {/* Hesap Sil */}
        <Animated.View entering={FadeInDown.delay(420).duration(400).springify()}>
          <Pressable
            onPress={handleDeleteAccount}
            style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={[styles.deleteText, { color: C.muted }]}>Hesabımı Sil</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(480).duration(400).springify()}>
          <Text style={[styles.version, { color: C.muted }]}>Maraton v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.subheading,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 60,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    marginTop: SPACING.lg,
  },
  logoutText: {
    ...TYPOGRAPHY.button,
  },
  deleteBtn: {
    alignItems: "center",
    paddingVertical: SPACING.md,
    marginTop: SPACING.xl,
  },
  deleteText: {
    ...TYPOGRAPHY.caption,
    textDecorationLine: "underline",
  },
  version: {
    ...TYPOGRAPHY.caption,
    textAlign: "center",
    marginTop: SPACING.xxl,
  },
});
