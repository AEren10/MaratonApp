import { View, Text, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Rect, Circle } from "react-native-svg";

import { useC } from "../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../themes/tokens";
import { Press } from "../../components/design/Press";
import * as H from "../../lib/haptics";
import { ActionBtn } from "./ActionBtn";

export function StoryActionRow({
  onShareInstagram,
  onShareTikTok,
  onCopyToClipboard,
  onSaveToGallery,
  onPickPhoto,
  onClearPhoto,
  hasPhoto,
  busy,
}) {
  const C = useC();

  const showPhotoInfo = () => {
    H.tap();
    Alert.alert(
      "📸 Masa Fotoğrafı & Şablon",
      "1. Fotoğrafını Ekle:\nÇalışma masanın veya kitabının fotoğrafını çek/seç.\n\n2. Otomatik Giydir:\nSeçtiğin şablon fotoğrafının tam üzerine 9:16 oranında oturur.\n\n3. Hızlıca Paylaş:\nInstagram veya TikTok'a hazır hikaye olarak tek tıkla gönder!",
      [{ text: "Harika, Anladım", style: "default" }]
    );
  };

  return (
    <View style={s.wrap}>
      <View style={s.row}>
        {/* 1. Instagram */}
        <Press haptic="none" disabled={busy} onPress={() => { H.tap(); onShareInstagram(); }} accessibilityRole="button" style={[s.item, { opacity: busy ? 0.5 : 1 }]}>
          <LinearGradient colors={["#833AB4", "#FD1D1D", "#FCB045"]} start={{ x: 0.1, y: 0.9 }} end={{ x: 0.9, y: 0.1 }} style={s.circle}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Rect x="2" y="2" width="20" height="20" rx="5.5" stroke="#FFFFFF" strokeWidth={2} />
              <Circle cx="12" cy="12" r="4.2" stroke="#FFFFFF" strokeWidth={2} />
              <Circle cx="17.5" cy="6.5" r="1.2" fill="#FFFFFF" />
            </Svg>
          </LinearGradient>
          <Text style={[TYPOGRAPHY.micro, s.label, { color: C.text }]}>{busy ? "…" : "Instagram"}</Text>
        </Press>

        {/* 2. TikTok */}
        <Press haptic="none" disabled={busy} onPress={() => { H.tap(); onShareTikTok?.(); }} accessibilityRole="button" style={[s.item, { opacity: busy ? 0.5 : 1 }]}>
          <View style={[s.circle, { backgroundColor: "#010101", borderColor: "#25F4EE", borderWidth: 1 }]}>
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
              <Path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-2.901 2.868 2.893 2.893 0 01-2.892-2.893 2.895 2.895 0 012.892-2.894c.328 0 .641.055.937.152V9.347a6.297 6.297 0 00-.937-.07A6.335 6.335 0 003.136 15.61a6.337 6.337 0 006.337 6.337 6.336 6.336 0 006.337-6.337V8.583a8.167 8.167 0 005.08 1.764V6.902a4.838 4.838 0 01-1.301-.216z" fill="#FFFFFF" />
            </Svg>
          </View>
          <Text style={[TYPOGRAPHY.micro, s.label, { color: C.text }]}>TikTok</Text>
        </Press>

        {/* 3. Fotoğraf */}
        <View style={s.item}>
          <Press haptic="none" disabled={busy} onPress={() => { H.tap(); onPickPhoto(); }} accessibilityRole="button" style={[s.circle, { backgroundColor: hasPhoto ? C.brandTint : C.elev, borderColor: hasPhoto ? C.accent : C.border, borderWidth: 1, opacity: busy ? 0.5 : 1 }]}>
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
              <Path d="M3 8a2 2 0 012-2h2.5l1.5-2h6l1.5 2H19a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke={hasPhoto ? C.accentBright : C.text} strokeWidth={1.8} />
              <Circle cx="12" cy="13" r="3.5" stroke={hasPhoto ? C.accentBright : C.text} strokeWidth={1.8} />
            </Svg>
            <Press haptic="none" onPress={showPhotoInfo} style={s.infoBadge}>
              <Text style={s.infoText}>i</Text>
            </Press>
          </Press>
          <Text style={[TYPOGRAPHY.micro, s.label, { color: hasPhoto ? C.accentBright : C.text2 }]}>{hasPhoto ? "Değiştir" : "Fotoğraf"}</Text>
        </View>

        {/* 4. Kopyala */}
        <ActionBtn C={C} busy={busy} label="Kopyala" onPress={onCopyToClipboard} icon={<Svg width={19} height={19} viewBox="0 0 24 24" fill="none"><Rect x="8" y="8" width="12" height="12" rx="2.5" stroke={C.text} strokeWidth={1.8} /><Path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" stroke={C.text2} strokeWidth={1.8} strokeLinecap="round" /></Svg>} />

        {/* 5. Kaydet */}
        <ActionBtn C={C} busy={busy} label="Kaydet" onPress={onSaveToGallery} icon={<Svg width={19} height={19} viewBox="0 0 24 24" fill="none"><Path d="M12 4v12m0 0l-4-4m4 4l4-4M4 18v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke={C.text} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>} />
      </View>

      {hasPhoto ? (
        <Press haptic="none" onPress={() => { H.tap(); onClearPhoto(); }} accessibilityRole="button" style={[s.clearPhotoBtn, { backgroundColor: C.void, borderColor: C.line }]}>
          <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
            <Path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke={C.danger || "#F0555F"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={[s.clearPhotoText, { color: C.text }]}>Fotoğrafı Kaldır</Text>
          <Text style={[s.clearPhotoSub, { color: C.text3 }]}>· Şeffaf Çıkartma</Text>
        </Press>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s3, alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", paddingHorizontal: STEP.s2 },
  item: { alignItems: "center", width: 62 },
  circle: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", position: "relative" },
  infoBadge: { position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: "rgba(100,100,110,0.85)", alignItems: "center", justifyContent: "center" },
  infoText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  label: { marginTop: 6, fontFamily: "Archivo_600", fontSize: 11 },
  clearPhotoBtn: { marginTop: STEP.s2, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  clearPhotoText: { fontFamily: "Archivo_600", fontSize: 11.5 },
  clearPhotoSub: { fontFamily: "Archivo_500", fontSize: 11 },
});
