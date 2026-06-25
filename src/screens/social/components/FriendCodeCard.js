import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, StyleSheet, Share } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Clipboard from "expo-clipboard";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useAlert } from "../../../contexts/AlertContext";
import { getMyFriendCode, sendFriendRequestByCode } from "../../../supabase/friends";
import * as H from "../../../lib/haptics";

export function FriendCodeCard({ onRequestSent, initialCode }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const { user } = useAuth();
  const showAlert = useAlert();
  const [myCode, setMyCode] = useState(null);
  const [codeInput, setCodeInput] = useState(initialCode || "");
  const [codeBusy, setCodeBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    getMyFriendCode(user.id).then(setMyCode).catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    if (initialCode) setCodeInput(initialCode.toUpperCase());
  }, [initialCode]);

  const copyCode = useCallback(async () => {
    if (!myCode) return;
    await Clipboard.setStringAsync(myCode);
    H.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [myCode]);

  const shareCode = useCallback(() => {
    if (!myCode) return;
    Share.share({ message: `Maraton'da benimle çalış! Arkadaşlık kodum: ${myCode}\nmaraton://friend/${myCode}` }).catch(() => {});
  }, [myCode]);

  const addByCode = useCallback(async () => {
    if (!codeInput.trim()) return;
    setCodeBusy(true);
    try {
      const { targetName } = await sendFriendRequestByCode(codeInput);
      H.success();
      showAlert("İstek gönderildi", `${targetName || "Kullanıcı"} adlı kişiye arkadaşlık isteği gönderildi.`);
      setCodeInput("");
      onRequestSent?.();
    } catch (e) {
      showAlert("Hata", e.message || "Kod geçersiz veya istek gönderilemedi.");
    }
    setCodeBusy(false);
  }, [codeInput, onRequestSent]);

  return (
    <>
      {myCode && (
        <Animated.View entering={FadeInDown.delay(40).duration(400).springify()} style={s.codeCard}>
          <Text style={s.label}>SENİN KODUN</Text>
          <View style={s.codeRow}>
            <Text style={s.codeValue}>{myCode}</Text>
            <Pressable onPress={copyCode} style={s.btn} hitSlop={8}>
              <Icon name={copied ? "check" : "copy"} size={16} color={copied ? C.green : C.accent} />
            </Pressable>
            <Pressable onPress={shareCode} style={s.btn} hitSlop={8}>
              <Icon name="share" size={16} color={C.accent} />
            </Pressable>
          </View>
          <Text style={s.hint}>Bu kodu arkadaşlarınla paylaş, seni eklesinler</Text>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(80).duration(400).springify()} style={s.addBox}>
        <Text style={s.label}>KOD İLE EKLE</Text>
        <View style={s.inputRow}>
          <TextInput
            value={codeInput}
            onChangeText={(t) => setCodeInput(t.toUpperCase())}
            placeholder="Arkadaşının kodunu gir"
            placeholderTextColor={C.muted}
            autoCapitalize="characters"
            maxLength={6}
            style={s.input}
          />
          <Pressable onPress={addByCode} disabled={codeBusy || codeInput.length < 4} style={[s.sendBtn, (codeBusy || codeInput.length < 4) && { opacity: 0.5 }]}>
            {codeBusy ? <ActivityIndicator size="small" color={C.bg} /> : <Icon name="plus" size={16} color={C.bg} sw={2.5} />}
          </Pressable>
        </View>
      </Animated.View>
    </>
  );
}

const makeStyles = (C) => StyleSheet.create({
  codeCard: {
    backgroundColor: C.accent + "0C",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: C.accent + "25",
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  label: { ...TYPOGRAPHY.label, color: C.muted, marginBottom: SPACING.xs },
  codeRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  codeValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 22, color: C.accent, letterSpacing: 4, flex: 1 },
  btn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.accent + "18",
    alignItems: "center", justifyContent: "center",
  },
  hint: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: SPACING.xs },
  addBox: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: C.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  input: {
    flex: 1,
    backgroundColor: C.surface2 || C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.body,
    color: C.text,
    letterSpacing: 3,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: RADIUS.md,
    backgroundColor: C.accent,
    alignItems: "center", justifyContent: "center",
  },
});
