import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { ErrorState, Icon, Loading } from "../../components/design";
import { Press } from "../../components/design/Press";
import { SCREENS } from "../../constants/screens";
import { useAlert } from "../../contexts/AlertContext";
import { useC } from "../../contexts/ThemeContext";
import { usePublicProfile } from "../../hooks/usePublicProfile";
import { CONTROL, GUTTER, NAV_ICON, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { PublicProfileHeader } from "./components/PublicProfileHeader";
import { PublicProfileStats } from "./components/PublicProfileStats";
import { PublicStrengthMap } from "./components/PublicStrengthMap";

export default function PublicProfileScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const showAlert = useAlert();
  const { profile, loading, sending, error, retry, addFriend } = usePublicProfile(route.params?.userId, showAlert);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const openRequests = useCallback(() => navigation.navigate(SCREENS.FRIENDS, { section: "requests" }), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <View style={styles.header}>
        <Press haptic="none" onPress={goBack} hitSlop={12} accessibilityLabel="Geri" style={styles.back}>
          <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
        </Press>
        <Text style={[TYPOGRAPHY.subheading, styles.title, { color: C.text }]}>Profil</Text>
        <View style={styles.back} />
      </View>
      {loading ? <Loading fullScreen message="Profil yükleniyor" /> : error || !profile ? (
        <ErrorState
          title="Profil açılamadı"
          body={error || "Bu profil artık görüntülenemiyor."}
          primary="Tekrar dene"
          secondary="Geri dön"
          onPrimary={retry}
          onSecondary={goBack}
          style={styles.state}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <PublicProfileHeader profile={profile} sending={sending} onAdd={addFriend} onRequests={openRequests} />
          <PublicProfileStats profile={profile} />
          <PublicStrengthMap subjects={profile.subjectProgress} />
          <Text style={[TYPOGRAPHY.caption, styles.privacy, { color: C.text3 }]}>Deneme ve net bilgileri gizlidir.</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s1 },
  back: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center" },
  scroll: { paddingBottom: STEP.s5 },
  state: { marginHorizontal: GUTTER },
  privacy: { marginHorizontal: GUTTER, marginTop: STEP.s4, textAlign: "center" },
});
