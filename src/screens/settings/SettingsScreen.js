import { useCallback } from "react";
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

import { SettingsGroup } from "./components/SettingsGroup";
import { SettingsRow } from "./components/SettingsRow";
import * as H from "../../lib/haptics";

// Ayarlar artık sade — Profile menüde olan kişisel öğeler burada gözükmüyor.
// Sadece sistem-tarafı tercihler: Bildirimler, Görünüm, Gizlilik, Yardım, Hakkında.
export default function SettingsScreen() {
  const navigation = useNavigation();
  const C = useC();
  const { logout, deleteAccount } = useAuth();
  const showAlert = useAlert();

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const go = useCallback((s) => navigation.navigate(s), [navigation]);

  const handleHelp = useCallback(() => {
    showAlert("Yardım", "Sorularını için bize ulaşabilirsin:\n\ndestek@maraton.app");
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
        <Pressable onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>Ayarlar</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(80).duration(400).springify()}>
          <SettingsGroup title="TERCİHLER">
            <SettingsRow
              icon="bell"
              iconColor={C.amber}
              label="Bildirimler"
              onPress={() => { H.tap(); go(SCREENS.NOTIFICATIONS_SETTINGS); }}
            />
            <SettingsRow
              icon="moon"
              iconColor={C.purple}
              label="Görünüm"
              onPress={() => { H.tap(); go(SCREENS.APPEARANCE); }}
            />
          </SettingsGroup>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(400).springify()}>
          <SettingsGroup title="UYGULAMA">
            <SettingsRow
              icon="lock"
              iconColor={C.blue}
              label="Gizlilik Politikası"
              onPress={() => { H.tap(); go(SCREENS.PRIVACY); }}
            />
            <SettingsRow
              icon="info"
              iconColor={C.green}
              label="Hakkında"
              onPress={() => { H.tap(); go(SCREENS.ABOUT); }}
            />
            <SettingsRow
              icon="share"
              iconColor={C.coral}
              label="Yardım"
              onPress={() => { H.tap(); handleHelp(); }}
            />
          </SettingsGroup>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(400).springify()}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutBtn,
              {
                backgroundColor: C.red + "12",
                borderColor: C.red + "30",
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Icon name="x" size={18} color={C.red} />
            <Text style={[styles.logoutText, { color: C.red }]}>Çıkış Yap</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(400).springify()}>
          <Pressable
            onPress={handleDeleteAccount}
            style={({ pressed }) => [
              styles.deleteBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.deleteText}>Hesabımı Sil</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400).springify()}>
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
    color: "#666",
    textDecorationLine: "underline",
  },
  version: {
    ...TYPOGRAPHY.caption,
    textAlign: "center",
    marginTop: SPACING.xxl,
  },
});
