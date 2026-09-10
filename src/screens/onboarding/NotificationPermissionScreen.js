import { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Linking } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { Button, ErrorState } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { NotificationBenefitList } from "./components/NotificationBenefitList";
import {
  requestNotificationPermissions,
  getNotifPrefs,
  applyNotifPrefs,
  ensurePushTokenRegistered,
} from "../../lib/notifications";
import * as H from "../../lib/haptics";

function NotificationPermissionContent() {
  const C = useC();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleAllow = useCallback(async () => {
    setBusy(true);
    const granted = await requestNotificationPermissions();
    if (granted) {
      H.success();
      try {
        const prefs = await getNotifPrefs();
        await applyNotifPrefs(prefs);
        await ensurePushTokenRegistered(user?.id);
      } catch {}
      setBusy(false);
      navigation.goBack();
      return;
    }
    setBusy(false);
    setDenied(true);
  }, [navigation, user?.id]);

  const handleSkip = useCallback(() => {
    H.tap();
    navigation.goBack();
  }, [navigation]);

  if (denied) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <ErrorState
          preset="notificationDenied"
          style={{ flex: 1, justifyContent: "center", paddingHorizontal: GUTTER }}
          onPrimary={() => Linking.openSettings()}
          onSecondary={handleSkip}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.delay(80)}>
          <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>ROTA YENİDEN ÇİZİLDİ</Text>
          <Text style={[styles.title, { color: C.text }]}>
            Tahminin değiştiğinde haber vereyim mi?
          </Text>
          <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s2 }]}>
            İlk denemen rotaya işlendi. Bundan sonra tahmin her değiştiğinde tek bir bildirim
            gelir — daha fazlası değil.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160)} style={{ marginTop: STEP.s4 }}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2, letterSpacing: 1.6 }]}>
            SANA NE GÖNDERİRİZ
          </Text>
          <View style={{ marginTop: STEP.s2 }}>
            <NotificationBenefitList />
          </View>
          <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s3 }]}>
            Hiçbir bildirim sana sadece çalış demez. Sadece rotanda önemli bir şey değişirse
            haber verir.
          </Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s1 }]}>
            Sıklığı ve saatini Ayarlar'dan değiştirebilirsin.
          </Text>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInDown.delay(240)}
        style={[styles.cta, { borderTopColor: C.line }]}
      >
        <Button onPress={handleAllow} size="lg" fullWidth loading={busy}>
          Evet, haber ver
        </Button>
        <Button onPress={handleSkip} variant="ghost" size="md" fullWidth style={{ marginTop: STEP.s1 }}>
          Şimdi olmasın
        </Button>
        <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s1, textAlign: "center" }]}>
          Şimdi olmasın dersen sistem penceresi hiç açılmaz — bir hafta sonra tekrar sorarız.
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

export default function NotificationPermissionScreen() {
  return (
    <ScreenErrorBoundary>
      <NotificationPermissionContent />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s4, paddingBottom: STEP.s3 },
  title: { ...TYPOGRAPHY.heading, marginTop: STEP.s2 },
  cta: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: STEP.s2, borderTopWidth: 1 },
});
