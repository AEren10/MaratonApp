import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Rect, Circle } from "react-native-svg";

import { useC } from "../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../themes/tokens";
import { Press } from "../../components/design/Press";
import * as H from "../../lib/haptics";

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

  return (
    <View style={s.wrap}>
      <View style={s.row}>
        {/* 1. Instagram Stories */}
        <Press
          haptic="none"
          disabled={busy}
          onPress={() => { H.tap(); onShareInstagram(); }}
          accessibilityRole="button"
          accessibilityLabel="Instagram Hikayesi"
          style={[s.item, { opacity: busy ? 0.5 : 1 }]}
        >
          <LinearGradient
            colors={["#833AB4", "#FD1D1D", "#FCB045"]}
            start={{ x: 0.1, y: 0.9 }}
            end={{ x: 0.9, y: 0.1 }}
            style={s.instaCircle}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Rect x="2" y="2" width="20" height="20" rx="5.5" stroke="#FFFFFF" strokeWidth="2" />
              <Circle cx="12" cy="12" r="4.2" stroke="#FFFFFF" strokeWidth="2" />
              <Circle cx="17.5" cy="6.5" r="1.2" fill="#FFFFFF" />
            </Svg>
          </LinearGradient>
          <Text style={[TYPOGRAPHY.micro, s.label, { color: C.text }]}>{busy ? "…" : "Instagram"}</Text>
        </Press>

        {/* 2. TikTok Stories */}
        <Press
          haptic="none"
          disabled={busy}
          onPress={() => { H.tap(); onShareTikTok?.(); }}
          accessibilityRole="button"
          accessibilityLabel="TikTok Hikayesi"
          style={[s.item, { opacity: busy ? 0.5 : 1 }]}
        >
          <View style={[s.actionCircle, { backgroundColor: "#010101", borderColor: "#25F4EE" }]}>
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
              <Path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-2.901 2.868 2.893 2.893 0 01-2.892-2.893 2.895 2.895 0 012.892-2.894c.328 0 .641.055.937.152V9.347a6.297 6.297 0 00-.937-.07A6.335 6.335 0 003.136 15.61a6.337 6.337 0 006.337 6.337 6.336 6.336 0 006.337-6.337V8.583a8.167 8.167 0 005.08 1.764V6.902a4.838 4.838 0 01-1.301-.216z" fill="#FFFFFF" />
            </Svg>
          </View>
          <Text style={[TYPOGRAPHY.micro, s.label, { color: C.text }]}>TikTok</Text>
        </Press>

        {/* 3. Fotoğraf Ekle / Çek */}
        <ActionBtn
          C={C}
          busy={busy}
          label={hasPhoto ? "Değiştir" : "Fotoğraf"}
          highlighted={hasPhoto}
          onPress={onPickPhoto}
          icon={
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
              <Path d="M3 8a2 2 0 012-2h2.5l1.5-2h6l1.5 2H19a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke={hasPhoto ? C.accentBright : C.text} strokeWidth="1.8" />
              <Circle cx="12" cy="13" r="3.5" stroke={hasPhoto ? C.accentBright : C.text} strokeWidth="1.8" />
            </Svg>
          }
        />

        {/* 4. Panoya Kopyala */}
        <ActionBtn
          C={C}
          busy={busy}
          label="Kopyala"
          onPress={onCopyToClipboard}
          icon={
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
              <Rect x="8" y="8" width="12" height="12" rx="2.5" stroke={C.text} strokeWidth="1.8" />
              <Path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" stroke={C.text2} strokeWidth="1.8" strokeLinecap="round" />
            </Svg>
          }
        />

        {/* 5. Galeriye Kaydet */}
        <ActionBtn
          C={C}
          busy={busy}
          label="Kaydet"
          onPress={onSaveToGallery}
          icon={
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
              <Path d="M12 4v12m0 0l-4-4m4 4l4-4M4 18v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke={C.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          }
        />
      </View>

      {hasPhoto ? (
        <Press haptic="none" onPress={() => { H.tap(); onClearPhoto(); }} accessibilityRole="button" style={s.clearPhotoBtn}>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>✕ Fotoğrafı Kaldır (Şeffaf Çıkartma)</Text>
        </Press>
      ) : null}
    </View>
  );
}

function ActionBtn({ C, busy, label, onPress, icon, highlighted }) {
  return (
    <Press haptic="none" disabled={busy} onPress={() => { H.tap(); onPress(); }} accessibilityRole="button" accessibilityLabel={label} style={[s.item, { opacity: busy ? 0.5 : 1 }]}>
      <View style={[s.actionCircle, { backgroundColor: highlighted ? C.brandTint : C.elev, borderColor: highlighted ? C.accent : C.border }]}>
        {icon}
      </View>
      <Text style={[TYPOGRAPHY.micro, s.label, { color: highlighted ? C.accentBright : C.text2 }]}>{label}</Text>
    </Press>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s3, alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", paddingHorizontal: STEP.s2 },
  item: { alignItems: "center", width: 62 },
  instaCircle: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  actionCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  label: { marginTop: 6, fontFamily: "Archivo_600", fontSize: 11 },
  clearPhotoBtn: { marginTop: STEP.s2, paddingVertical: 4 },
});
