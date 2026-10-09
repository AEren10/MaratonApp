import { memo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Icon } from "../../components/design/Icon";
import { Press } from "../../components/design/Press";
import ScreenErrorBoundary from "../../components/common/ScreenErrorBoundary";
import { useAlert } from "../../contexts/AlertContext";
import { useExam } from "../../contexts/ExamContext";
import { useC } from "../../contexts/ThemeContext";
import { useReferrals } from "../../hooks/useReferrals";
import { GUTTER, NAV_ICON, STEP, TYPOGRAPHY } from "../../themes/tokens";

import { ReferralApplyCard } from "./components/ReferralApplyCard";
import { ReferralHeroPass } from "./components/ReferralHeroPass";
import { ReferralHowItWorks } from "./components/ReferralHowItWorks";
import { ReferralSkeleton } from "./components/ReferralSkeleton";
import { ReferralStatsCard } from "./components/ReferralStatsCard";

export function ReferralScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const { examType } = useExam();
  const showAlert = useAlert();

  const {
    code,
    stats,
    loading,
    copied,
    friendCode,
    setFriendCode,
    applying,
    handleCopy,
    handleShare,
    handleApply,
  } = useReferrals({ routeCode: route.params?.code, examType, showAlert });

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
        <View style={s.header}>
          <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12}>
            <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
          </Press>
          <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: STEP.s2 }]}>
            Arkadaşını Davet Et
          </Text>
        </View>
        <ReferralSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <View style={s.header}>
        <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
        </Press>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: STEP.s2 }]}>
          Arkadaşını Davet Et
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.flex}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Tanıtım Başlığı */}
          <View style={s.intro}>
            <Text style={[TYPOGRAPHY.heading, { color: C.text, textAlign: "center" }]}>
              Birlikte Hazırlanın
            </Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.text3, textAlign: "center", marginTop: 4 }]}>
              Sınav yolculuğu tek başına zordur. Çalışma arkadaşını davet et, hedeflere birlikte koşun.
            </Text>
          </View>

          {/* 1. Özel Davet Pasaportu (Hero Pass) */}
          <ReferralHeroPass
            code={code}
            copied={copied}
            onCopy={handleCopy}
            onShare={handleShare}
            C={C}
          />

          {/* 2. Sosyal Durum & Davet Sayacı */}
          <ReferralStatsCard count={stats?.referralCount ?? 0} C={C} />

          {/* 3. Arkadaşının Kodunu Girme Alanı */}
          <ReferralApplyCard
            friendCode={friendCode}
            onChangeCode={setFriendCode}
            onApply={handleApply}
            applying={applying}
            C={C}
          />

          {/* 4. Nasıl Çalışır Rehberi */}
          <ReferralHowItWorks C={C} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default memo(function WrappedReferralScreen(props) {
  return (
    <ScreenErrorBoundary screenName="ReferralScreen">
      <ReferralScreen {...props} />
    </ScreenErrorBoundary>
  );
});

const s = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
  },
  scroll: {
    paddingHorizontal: GUTTER,
    paddingBottom: STEP.s5,
    gap: STEP.s2,
  },
  intro: {
    alignItems: "center",
    paddingVertical: STEP.s1,
    paddingHorizontal: STEP.s1,
  },
});
