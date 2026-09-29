import { ScrollView, View, Text, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { openProgram, PROGRAM_VIEWS } from "../../navigation/openProgram";
import appConfig from "../../../app.json";
import { Press } from "../../components/design/Press";

import { SettingsIdentityCard } from "./components/SettingsIdentityCard";
import { SettingsGroup } from "./components/SettingsGroup";
import { SettingsRow } from "./components/SettingsRow";
import { SettingsDangerGroup } from "./components/SettingsDangerGroup";
import { SyncStatusGroup } from "./components/SyncStatusGroup";
import { useSettingsViewModel } from "./useSettingsViewModel";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const C = useC();
  const vm = useSettingsViewModel(navigation);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Press>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Ayarlar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View>
          <SettingsIdentityCard
            displayName={vm.displayName}
            examLabel={vm.examLabel}
            daysLeft={vm.daysLeft}
            avatarUrl={vm.user?.user_metadata?.avatar_url}
            onPress={vm.go(SCREENS.EDIT_PROFILE)}
          />
        </Animated.View>

        <Animated.View>
          <SettingsGroup title="ROTA">
            <SettingsRow first label="Hedef net" value={vm.targetNetLabel} onPress={vm.go(SCREENS.GOALS)} />
            <SettingsRow label="Sınav tarihi" value={vm.examDateLabel} onPress={vm.go(SCREENS.EXAM_DATE)} />
            <SettingsRow label="Günlük soru hedefi" value={vm.dailyGoalLabel} onPress={vm.go(SCREENS.GOALS)} />
            <SettingsRow label="Haftalık ders programı" onPress={vm.go(SCREENS.CLASS_SCHEDULE)} />
            <SettingsRow label="Günlük rutin" value="Her gün paragraf, problem…" onPress={vm.go(SCREENS.ROUTE_HABITS)} />
            <SettingsRow label="Net eşiği" hint="Hedef bölüm karşılaştırması" onPress={vm.gatedGo("rank_simulator", SCREENS.RANK_SIMULATOR)} />
          </SettingsGroup>
        </Animated.View>

        <Animated.View>
          <SettingsGroup title="ÇALIŞMA">
            <SettingsRow first label="Çalışma geçmişi" onPress={vm.go(SCREENS.STUDY_LOG)} />
            <SettingsRow label="Takvim" onPress={() => openProgram(navigation, PROGRAM_VIEWS.MONTH)} />
          </SettingsGroup>
        </Animated.View>

        <Animated.View>
          <SettingsGroup title="BİLDİRİMLER">
            <SettingsRow first label="Bildirimler" hint="Durak hatırlatması, günlük tekrar, haftalık rapor" onPress={vm.go(SCREENS.NOTIFICATIONS_SETTINGS)} />
          </SettingsGroup>
        </Animated.View>

        <Animated.View>
          <SettingsGroup title="UYGULAMA">
            <SettingsRow first label="Görünüm" value={vm.themeLabel} onPress={vm.go(SCREENS.APPEARANCE)} />
            <SettingsRow label="Titreşim" toggle value={vm.hapticsOn} onToggle={vm.toggleHaptics} />
            <SettingsRow label="Gizlilik" onPress={vm.go(SCREENS.PRIVACY)} />
            <SettingsRow label="Kullanım koşulları" onPress={vm.go(SCREENS.TERMS)} />
            <SettingsRow label="Hakkında" onPress={vm.go(SCREENS.ABOUT)} />
            <SettingsRow label="Yardım" hint="destek@maraton.app" onPress={vm.handleHelp} />
          </SettingsGroup>
        </Animated.View>

        <Animated.View>
          <SyncStatusGroup />
        </Animated.View>

        <Animated.View>
          <SettingsGroup title="ARKADAŞLAR">
            <SettingsRow first label="Arkadaşlar" onPress={vm.go(SCREENS.FRIENDS)} />
            <SettingsRow label="Yol arkadaşın" onPress={vm.go(SCREENS.ROUTE_COMPANION)} />
            <SettingsRow label="Challenge" onPress={vm.go(SCREENS.CHALLENGE)} />
            <SettingsRow label="Davet et" onPress={vm.go(SCREENS.REFERRAL)} />
          </SettingsGroup>
        </Animated.View>

        <Animated.View>
          <SettingsGroup title="HESAP">
            {vm.hasSubscription ? <SettingsRow first label="Abonelik ve hesap" onPress={vm.go(SCREENS.SUBSCRIPTION)} /> : null}
            <SettingsRow first={!vm.hasSubscription} label="E-posta değiştir" onPress={vm.go(SCREENS.EDIT_EMAIL)} />
            <SettingsRow label="Şifre değiştir" onPress={vm.go(SCREENS.CHANGE_PASSWORD)} />
          </SettingsGroup>
        </Animated.View>

        <Animated.View>
          <SettingsDangerGroup onLogout={vm.handleLogout} onDeleteAccount={vm.handleDeleteAccount} />
        </Animated.View>

        <Text style={[TYPOGRAPHY.micro, styles.version, { color: C.text3 }]}>
          {`Maraton ${appConfig?.expo?.version || ""}`}
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
  scroll: { paddingBottom: 60 },
  version: { textAlign: "center", marginTop: STEP.s4 },
});
