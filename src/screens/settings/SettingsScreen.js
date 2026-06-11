import { useState, useCallback } from "react";
import { ScrollView, View, Text, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { useAuth } from "../../contexts/AuthContext";
import { resetPassword } from "../../supabase/auth";

import { SettingsGroup } from "./components/SettingsGroup";
import { SettingsRow } from "./components/SettingsRow";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const go = useCallback((s) => navigation.navigate(s), [navigation]);

  const handleEmail = useCallback(() => {
    Alert.alert("E-posta", user?.email || "Bilinmiyor");
  }, [user?.email]);

  const handlePasswordReset = useCallback(() => {
    const email = user?.email;
    if (!email) return;
    Alert.alert("Sifre Sifirlama", `${email} adresine sifre sifirlama bağlantisi gonderilsin mi?`, [
      { text: "Iptal", style: "cancel" },
      {
        text: "Gonder",
        onPress: async () => {
          const { error } = await resetPassword(email);
          if (error) Alert.alert("Hata", error.message);
          else Alert.alert("Basarili", "Sifre sifirlama bağlantisi e-posta adresine gonderildi.");
        },
      },
    ]);
  }, [user?.email]);

  const handleHelp = useCallback(() => {
    Alert.alert("Yardim", "Sorularin icin bize ulasabilirsin:\n\ndestek@maraton.app");
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert("Cikis Yap", "Hesabindan cikis yapmak istedigin kesin mi?", [
      { text: "Iptal", style: "cancel" },
      { text: "Cikis Yap", style: "destructive", onPress: logout },
    ]);
  }, [logout]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Account */}
        <SettingsGroup title="HESAP">
          <SettingsRow icon="user" iconColor={C.blue} label="Profil Duzenle" onPress={() => go(SCREENS.PROFILE)} />
          <SettingsRow icon="mail" iconColor={C.green} label="E-posta" onPress={handleEmail} />
          <SettingsRow icon="lock" iconColor={C.purple} label="Sifre Degistir" onPress={handlePasswordReset} />
        </SettingsGroup>

        <SettingsGroup title="TERCIHLER">
          <SettingsRow
            icon="bell" iconColor={C.amber}
            label="Bildirimler"
            onPress={() => go(SCREENS.NOTIFICATIONS_SETTINGS)}
          />
          <SettingsRow
            icon="moon" iconColor={C.purple}
            label="Gorunum"
            onPress={() => go(SCREENS.APPEARANCE)}
          />
        </SettingsGroup>

        <SettingsGroup title="UYGULAMA">
          <SettingsRow icon="info" iconColor={C.blue} label="Hakkinda" onPress={() => go(SCREENS.ABOUT)} />
          <SettingsRow icon="shield" iconColor={C.green} label="Gizlilik Politikasi" onPress={() => go(SCREENS.PRIVACY)} />
          <SettingsRow icon="share" iconColor={C.amber} label="Yardim" onPress={handleHelp} />
        </SettingsGroup>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Icon name="logOut" size={20} color={C.red} />
          <Text style={styles.logoutText}>Cikis Yap</Text>
        </Pressable>

        <Text style={styles.version}>Maraton v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.subheading,
    color: C.text,
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
    backgroundColor: C.red + "18",
    borderWidth: 1,
    borderColor: C.red + "40",
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    marginTop: SPACING.sm,
  },
  logoutText: {
    ...TYPOGRAPHY.button,
    color: C.red,
  },
  version: {
    ...TYPOGRAPHY.caption,
    color: C.muted,
    textAlign: "center",
    marginTop: SPACING.xxl,
  },
};
