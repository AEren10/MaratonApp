import { View, Text, ScrollView, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { SettingsRow } from "./components/SettingsRow";
import { EditProfileAvatar } from "./components/EditProfileAvatar";
import { EditProfileField } from "./components/EditProfileField";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useEditProfileForm } from "../../hooks/useEditProfileForm";

// Tasarim: "Profil Düzenle" artboard'u. SINIF ve KULLANICI ADI alanları
// tasarımda var ama profiles tablosunda karşılığı yok (grade/username
// kolonu yok) — veriyle desteklenmeyen alan gösterilmiyor (AGENTS.md).
// HEDEF BÖLÜM gerçek kolon (target_department); tasarımdaki gibi ok
// içeriyor ve mevcut bölüm seçme deneyimine (GoalsScreen) yönlendiriyor.
export default function EditProfileScreen() {
  const navigation = useNavigation();
  const C = useC();
  const {
    name, setName, showInLeaderboard, toggleLeaderboard,
    targetDepartment, loading, saving, errors, save,
  } = useEditProfileForm();

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <ActivityIndicator color={C.accent} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Tasarimin baslik alani BOS (yalniz geri + sagda "Kaydet"), gorsel
          duzen aynen korunuyor. Ancak basliksiz bir ekran, ekran okuyucu
          kullanicisina hicbir baglam vermiyor: baslik gorunmez bir
          erisilebilirlik etiketi olarak veriliyor. */}
      <View style={s.header} accessibilityRole="header" accessibilityLabel="Profil düzenle">
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Geri"
        >
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={save}
          disabled={saving}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Profili kaydet"
          accessibilityState={{ disabled: saving, busy: saving }}
        >
          <Text style={[s.save, { color: C.accentBright, opacity: saving ? 0.5 : 1 }]}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll}>
          <Animated.View entering={FadeInDown.delay(80).duration(400).springify()}>
            <EditProfileAvatar name={name} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).duration(400).springify()} style={{ marginTop: STEP.s4 }}>
            <EditProfileField
              label="AD SOYAD"
              value={name}
              onChangeText={setName}
              placeholder="Adın Soyadın"
              maxLength={50}
              error={errors.name}
            />

            {targetDepartment ? (
              <View style={{ marginTop: STEP.s3 }}>
                <EditProfileField
                  label="HEDEF BÖLÜM"
                  value={targetDepartment}
                  onPress={() => navigation.navigate(SCREENS.GOALS)}
                />
              </View>
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).duration(400).springify()} style={{ marginTop: STEP.s4 }}>
            <SettingsRow
              label="Profilim herkese açık"
              hint="Ligdeki diğer öğrenciler görebilir"
              toggle
              value={showInLeaderboard}
              onToggle={toggleLeaderboard}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: GUTTER, paddingVertical: STEP.s1,
  },
  save: { fontFamily: "Archivo_700", fontSize: 13 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 60 },
});
