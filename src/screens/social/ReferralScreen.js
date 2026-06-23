import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";

import { Icon, AnimatedPressable } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import {
  getOrCreateReferralCode,
  applyReferralCode,
  getReferralStats,
} from "../../supabase/referrals";
import { usePremium } from "../../contexts/PremiumContext";
import * as H from "../../lib/haptics";

const REWARD_DAYS = 7;

export default function ReferralScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const { user } = useAuth();
  const showAlert = useAlert();
  const { refreshPremium } = usePremium();

  const [code, setCode] = useState(null);
  const [stats, setStats] = useState({ referralCount: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [friendCode, setFriendCode] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    let cancelled = false;
    (async () => {
      try {
        const [c, st] = await Promise.all([
          getOrCreateReferralCode(user.id),
          getReferralStats(user.id),
        ]);
        if (!cancelled) {
          setCode(c);
          setStats(st);
        }
      } catch {
        if (!cancelled) showAlert("Hata", "Referral kodu alınamadı.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const handleCopy = useCallback(async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    H.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleShare = useCallback(async () => {
    if (!code) return;
    H.medium();
    try {
      await Share.share({
        message: `Maraton ile birlikte YKS'ye hazırlanmak ister misin? Davet kodum: ${code} — ikinize de 1 hafta Premium hediye! 🎯`,
      });
    } catch {
      handleCopy();
    }
  }, [code, handleCopy]);

  const handleApply = useCallback(async () => {
    if (!friendCode.trim() || !user?.id) return;
    setApplying(true);
    try {
      const result = await applyReferralCode(user.id, friendCode);
      if (result.ok) {
        H.success();
        await refreshPremium();
        showAlert("Başarılı!", `Davet kodu uygulandı. ${REWARD_DAYS} gün Premium kazandın!`);
        setFriendCode("");
      } else if (result.reason === "invalid") {
        showAlert("Geçersiz Kod", "Bu davet kodu bulunamadı.");
      } else if (result.reason === "self") {
        showAlert("Hata", "Kendi davet kodunu kullanamazsın.");
      } else if (result.reason === "already_used") {
        showAlert("Zaten Kullanıldı", "Daha önce bir davet kodu kullandın.");
      }
    } catch {
      showAlert("Hata", "Bir sorun oluştu, tekrar dene.");
    } finally {
      setApplying(false);
    }
  }, [friendCode, user?.id, refreshPremium, showAlert]);

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={s.safe}>
        <ActivityIndicator color={C.accent} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>
          Arkadaşını Davet Et
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={ZoomIn.delay(100).springify()} style={[s.heroCircle, { backgroundColor: C.accent + "18" }]}>
          <Icon name="users" size={36} color={C.accent} />
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(200)} style={[s.title, { color: C.text }]}>
          Birlikte Çalışın
        </Animated.Text>
        <Animated.Text entering={FadeInUp.delay(260)} style={[s.subtitle, { color: C.sec }]}>
          Arkadaşlarını davet et, ikiniz de {REWARD_DAYS} gün Premium kazanın
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(350)} style={[s.codeCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[s.codeLabel, { color: C.sec }]}>DAVET KODUN</Text>
          <Text style={[s.codeText, { color: C.accent }]}>{code || "..."}</Text>

          <View style={s.codeActions}>
            <AnimatedPressable onPress={handleCopy} haptic="tap" style={[s.actionBtn, { borderColor: C.border }]}>
              <Icon name={copied ? "check" : "copy"} size={16} color={copied ? C.green : C.text} />
              <Text style={[s.actionBtnText, { color: copied ? C.green : C.text }]}>
                {copied ? "Kopyalandı" : "Kopyala"}
              </Text>
            </AnimatedPressable>

            <AnimatedPressable onPress={handleShare} haptic="medium" style={[s.actionBtn, { backgroundColor: C.accent, borderColor: C.accent }]}>
              <Icon name="share" size={16} color="#FFFFFF" />
              <Text style={[s.actionBtnText, { color: "#FFFFFF" }]}>Paylaş</Text>
            </AnimatedPressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450)} style={[s.statCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[s.statIcon, { backgroundColor: C.green + "18" }]}>
            <Icon name="users" size={20} color={C.green} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[TYPOGRAPHY.stat, { color: C.text, fontSize: 24 }]}>
              {stats.referralCount}
            </Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.sec }]}>
              kişiyi davet ettin
            </Text>
          </View>
          <Text style={[TYPOGRAPHY.statSmall, { color: C.green }]}>
            +{stats.referralCount * REWARD_DAYS} gün
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(550)} style={[s.inputCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[s.inputLabel, { color: C.text }]}>Davet kodun var mı?</Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.sec, marginBottom: SPACING.md }]}>
            Arkadaşının davet kodunu gir, ikiniz de Premium kazanın
          </Text>

          <View style={s.inputRow}>
            <TextInput
              value={friendCode}
              onChangeText={(t) => setFriendCode(t.toUpperCase())}
              placeholder="XXXXXX"
              placeholderTextColor={C.muted}
              maxLength={6}
              autoCapitalize="characters"
              style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
            />
            <AnimatedPressable
              onPress={handleApply}
              haptic="medium"
              disabled={friendCode.trim().length < 4 || applying}
              style={[
                s.applyBtn,
                { backgroundColor: friendCode.trim().length >= 4 ? C.accent : C.surface2 },
              ]}
            >
              {applying ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={s.applyBtnText}>Uygula</Text>
              )}
            </AnimatedPressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(650)} style={[s.howCard, { backgroundColor: C.surface2 + "60" }]}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text, marginBottom: SPACING.sm }]}>Nasıl Çalışır?</Text>
          {[
            "Davet kodunu arkadaşınla paylaş",
            "Arkadaşın uygulamayı indirip kodunu girsin",
            "İkiniz de " + REWARD_DAYS + " gün Premium kazanın",
          ].map((step, i) => (
            <View key={i} style={s.stepRow}>
              <View style={[s.stepNum, { backgroundColor: C.accent + "20" }]}>
                <Text style={[TYPOGRAPHY.captionMedium, { color: C.accent }]}>{i + 1}</Text>
              </View>
              <Text style={[TYPOGRAPHY.body, { color: C.sec, flex: 1 }]}>{step}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    scroll: {
      alignItems: "center",
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xl,
      paddingBottom: 40,
    },
    heroCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    title: { ...TYPOGRAPHY.heading, fontSize: 24, marginTop: SPACING.lg },
    subtitle: {
      ...TYPOGRAPHY.body,
      textAlign: "center",
      marginTop: SPACING.xs,
      marginBottom: SPACING.xl,
    },
    codeCard: {
      width: "100%",
      alignItems: "center",
      padding: SPACING.xl,
      borderRadius: RADIUS.xxl,
      borderWidth: 1,
    },
    codeLabel: {
      ...TYPOGRAPHY.label,
      letterSpacing: 1.5,
      marginBottom: SPACING.sm,
    },
    codeText: {
      fontFamily: "SpaceGrotesk_700Bold",
      fontSize: 36,
      letterSpacing: 4,
    },
    codeActions: {
      flexDirection: "row",
      gap: SPACING.sm,
      marginTop: SPACING.lg,
      width: "100%",
    },
    actionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 14,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
    },
    actionBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
    statCard: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      padding: SPACING.lg,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      marginTop: SPACING.md,
    },
    statIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    inputCard: {
      width: "100%",
      padding: SPACING.lg,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      marginTop: SPACING.md,
    },
    inputLabel: { ...TYPOGRAPHY.bodySemiBold, marginBottom: 4 },
    inputRow: { flexDirection: "row", gap: SPACING.sm },
    input: {
      flex: 1,
      fontFamily: "SpaceGrotesk_700Bold",
      fontSize: 18,
      letterSpacing: 3,
      textAlign: "center",
      paddingVertical: 12,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
    },
    applyBtn: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: RADIUS.lg,
      alignItems: "center",
      justifyContent: "center",
      ...SHADOWS.card,
    },
    applyBtnText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: "#FFFFFF",
    },
    howCard: {
      width: "100%",
      padding: SPACING.lg,
      borderRadius: RADIUS.xl,
      marginTop: SPACING.lg,
    },
    stepRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginTop: SPACING.sm,
    },
    stepNum: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
