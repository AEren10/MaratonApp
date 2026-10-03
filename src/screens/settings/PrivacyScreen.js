import { useCallback } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, NAV_ICON } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { SCREENS } from "../../constants/screens";
import { LEGAL_DOCS } from "../../constants/legalDocs";
import { SettingsGroup } from "./components/SettingsGroup";
import { SettingsRow } from "./components/SettingsRow";
import { useSettingsActions } from "./useSettingsActions";
import { Press } from "../../components/design/Press";
import { useProfileVisibility } from "../../hooks/useProfileVisibility";

// Tasarimin "Gizlilik" ekrani bir HUB: belge satirlari + VERILERIN grubu.
// Politika METNI artik burada degil, "Belge" ekraninda (DocumentScreen);
// icerik src/constants/legalDocs.js icinde tek kaynakta.
export default function PrivacyScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { handleDeleteAccount } = useSettingsActions();
  // Kayit ekranindan (giristen once) da aciliyor: veri indirme ve hesap
  // silme oturum ister, o yigina kayitli da degil.
  const { user } = useAuth();
  const { groupVisible, loading: visibilityLoading, update: updateVisibility } = useProfileVisibility();

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const openExport = useCallback(() => navigation.navigate(SCREENS.DATA_EXPORT), [navigation]);
  const openDoc = useCallback(
    (docKey) => () => navigation.navigate(SCREENS.DOCUMENT, { docKey }),
    [navigation],
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Press haptic="none" onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
        </Press>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>
          Gizlilik ve şartlar
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Tasarim ucuncu bir satir daha gosteriyor: "KVKK aydinlatma metni".
            Icerik saglanmadan cizilmiyor -- yasal metin uydurulamaz ve bos
            bir belge yayin riski olurdu. legalDocs.js'e eklendigi an burada
            kendiliginden gorunecek. */}
        <SettingsGroup>
          <SettingsRow
            first
            label={LEGAL_DOCS.privacy.title}
            hint={`Son güncelleme ${LEGAL_DOCS.privacy.lastUpdated}`}
            onPress={openDoc("privacy")}
          />
          <SettingsRow
            label={LEGAL_DOCS.terms.title}
            hint={`Son güncelleme ${LEGAL_DOCS.terms.lastUpdated}`}
            onPress={openDoc("terms")}
          />
        </SettingsGroup>

        {user ? (
          <>
            <SettingsGroup title="PROFİL">
              <SettingsRow
                first
                label="Profilimi kimler görebilir"
                hint={groupVisible ? "Grup üyeleri ve arkadaşlar" : "Yalnız arkadaşlar"}
                toggle
                value={groupVisible}
                disabled={visibilityLoading}
                onToggle={updateVisibility}
              />
            </SettingsGroup>
            <SettingsGroup title="VERİLERİN">
              <SettingsRow first label="Verilerimi indir" onPress={openExport} />
              <SettingsRow label="Hesabımı sil" danger onPress={handleDeleteAccount} />
            </SettingsGroup>
          </>
        ) : null}

        <Text style={[TYPOGRAPHY.body, styles.note, { color: C.text3 }]}>
          Rota verisi hesabında sunucuda tutulur. Telefon değişse de
          kayıtların kaybolmaz.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
  },
  scroll: { paddingBottom: 60 },
  note: { marginHorizontal: GUTTER, marginTop: STEP.s4 },
});
