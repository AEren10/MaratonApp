import { View, Text, Pressable, StyleSheet, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { useMemo } from "react";

export default function PaymentCardScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable 
          hitSlop={12} 
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
        >
          <Icon name="chevronLeft" size={24} color={C.text2} />
        </Pressable>
        <Text style={s.headerTitle}>Ödeme</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.planCard}>
          <View style={s.planHeader}>
            <Text style={s.planTitle}>Yıllık</Text>
            <Text style={s.planPrice}>
              ₺89<Text style={s.planPriceSpan}>/ay</Text>
            </Text>
          </View>
          <Text style={s.planDesc}>12 ay tek ödeme ₺1.068 · Aylık plan ₺149/ay</Text>
        </View>

        <Text style={s.trialText}>
          7 gün ücretsiz. İlk ödeme 30 Haziran 2026'da alınır.
        </Text>

        <View style={s.formSection}>
          <View style={s.fieldBlock}>
            <Text style={s.fieldLabel}>KART NUMARASI</Text>
            <View style={s.inputWrapper}>
              <TextInput 
                style={s.input} 
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={C.text3}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={s.fieldBlock}>
            <Text style={s.fieldLabel}>KART ÜZERİNDEKİ AD</Text>
            <Text style={s.fieldHelper}>Kart sahibi başkasıysa onun adını yaz.</Text>
            <View style={s.inputWrapper}>
              <TextInput 
                style={s.input} 
                placeholder="Ahmet Yılmaz"
                placeholderTextColor={C.text3}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={s.row}>
            <View style={[s.fieldBlock, { flex: 1 }]}>
              <Text style={s.fieldLabel}>SON KULLANMA</Text>
              <View style={s.inputWrapper}>
                <TextInput 
                  style={s.input} 
                  placeholder="AA/YY"
                  placeholderTextColor={C.text3}
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <View style={[s.fieldBlock, { flex: 1 }]}>
              <Text style={s.fieldLabel}>CVC</Text>
              <View style={s.inputWrapper}>
                <TextInput 
                  style={s.input} 
                  placeholder="000"
                  placeholderTextColor={C.text3}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom */}
      <View style={s.footerContainer}>
        <View style={s.trustRow}>
          <Icon name="lock" size={14} color={C.text4} />
          <Text style={s.trustText}>
            Kart bilgileri bizde tutulmaz, bankaya doğrudan iletilir.
          </Text>
        </View>
        <Pressable 
          style={({ pressed }) => [
            s.primaryBtn,
            pressed && { transform: [{ scale: 0.98 }], backgroundColor: C.accentPress }
          ]}
          onPress={() => navigation.navigate(SCREENS.PAYMENT_PROCESSING)}
        >
          <Text style={s.primaryBtnText}>7 gün ücretsiz başla</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { 
      flex: 1, 
      backgroundColor: C.bg 
    },
    header: { 
      flexDirection: "row", 
      alignItems: "center", 
      gap: 14,
      paddingHorizontal: GUTTER, 
      paddingTop: STEP.s1,
      paddingBottom: STEP.s3
    },
    backBtn: {
      marginLeft: -6,
    },
    headerTitle: { 
      fontFamily: "BricolageGrotesque_400Regular",
      fontSize: 22,
      color: C.text 
    },
    scrollContent: {
      paddingHorizontal: GUTTER,
      paddingBottom: 140, // space for fixed footer
      paddingTop: STEP.s3,
    },
    
    // Plan Info
    planCard: {
      paddingHorizontal: 20,
      paddingVertical: 18,
      borderRadius: SHAPE.card,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.accent,
    },
    planHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
    },
    planTitle: {
      fontFamily: "Archivo_700Bold",
      fontSize: 13.5,
      color: C.text,
    },
    planPrice: {
      fontFamily: "BricolageGrotesque_400Regular",
      fontSize: 26,
      color: C.text,
      fontVariant: ["tabular-nums"],
    },
    planPriceSpan: {
      fontFamily: "Archivo_500Medium",
      fontSize: 13,
      color: C.text3,
    },
    planDesc: {
      fontFamily: "Archivo_500Medium",
      fontSize: 11.5,
      color: C.text3,
      marginTop: 6,
    },
    trialText: {
      fontFamily: "Archivo_400Regular",
      fontSize: 12,
      lineHeight: 19.2, // 1.6
      color: C.text3,
      marginTop: STEP.s2,
    },

    // Form
    formSection: {
      marginTop: STEP.s2,
      gap: 14,
    },
    fieldBlock: {
      marginTop: 14,
    },
    row: {
      flexDirection: "row",
      gap: STEP.s2,
    },
    fieldLabel: {
      fontFamily: "Archivo_600SemiBold",
      fontSize: 11.5,
      letterSpacing: 1.84, // .16em
      color: C.text3,
      textTransform: "uppercase"
    },
    fieldHelper: {
      fontFamily: "Archivo_400Regular",
      fontSize: 12,
      lineHeight: 18,
      color: C.text3,
      marginTop: 6,
    },
    inputWrapper: {
      height: 52,
      marginTop: 8,
      borderRadius: SHAPE.button,
      backgroundColor: C.void,
      borderWidth: 1,
      borderColor: C.border,
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    input: {
      fontFamily: "BricolageGrotesque_400Regular",
      fontSize: 16,
      color: C.text,
      fontVariant: ["tabular-nums"],
      flex: 1,
      padding: 0,
    },

    // Footer
    footerContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: GUTTER,
      paddingTop: 14,
      paddingBottom: 26,
      // React Native'de gradient için expo-linear-gradient gerekir, 
      // şimdilik yarı saydam zemin
      backgroundColor: C.bg, 
      borderTopWidth: 1,
      borderTopColor: C.line,
    },
    trustRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: STEP.s2,
    },
    trustText: {
      fontFamily: "Archivo_400Regular",
      fontSize: 11.5,
      color: C.text3,
    },
    primaryBtn: {
      width: "100%",
      height: 52,
      borderRadius: SHAPE.button,
      backgroundColor: C.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryBtnText: {
      ...TYPOGRAPHY.button,
      color: C.accentInk,
    }
  });
}
