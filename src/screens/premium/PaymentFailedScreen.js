import { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Rect, Path, Circle } from "react-native-svg";
import { Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { ROOT_STACK } from "../../navigation/routes";

export default function PaymentFailedScreen() {
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

      <View style={s.centerBlock}>
        <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
          <Rect x={8} y={18} width={56} height={38} rx={6} stroke={C.text4} strokeWidth={2} />
          <Path d="M8 29h56" stroke={C.text4} strokeWidth={2} />
          <Path d="M26 44h10" stroke={C.text5} strokeWidth={2} strokeLinecap="round" />
          <Circle cx={55} cy={52} r={13} fill={C.bg} />
          <Circle cx={55} cy={52} r={11} stroke={C.warn} strokeWidth={2} />
          <Path d="M55 46.5v6M55 56.4v.2" stroke={C.warn} strokeWidth={2} strokeLinecap="round" />
        </Svg>
        <Text style={s.title}>Ödeme tamamlanmadı.</Text>
        <Text style={s.subtitle}>Bankan işlemi onaylamadı. Hesabından para çekilmedi.</Text>
      </View>

      <View style={s.detailsBlock}>
        <View style={s.responseCard}>
          <Text style={s.responseLabel}>BANKA YANITI</Text>
          <Text style={s.responseText}>Kart limiti yetersiz · kod 51</Text>
        </View>

        <View style={s.tipsList}>
          <View style={s.tipRow}>
            <View style={s.tipDot} />
            <Text style={s.tipText}>Kart limitini kontrol et</Text>
          </View>
          <View style={s.tipRow}>
            <View style={s.tipDot} />
            <Text style={s.tipText}>Başka bir kart dene</Text>
          </View>
          <View style={s.tipRow}>
            <View style={s.tipDot} />
            <Text style={s.tipText}>Bankanın internetten alışverişe izin verdiğinden emin ol</Text>
          </View>
        </View>
      </View>

      <View style={s.footerContainer}>
        <Pressable 
          style={({ pressed }) => [
            s.primaryBtn,
            pressed && { transform: [{ scale: 0.98 }], backgroundColor: C.accentPress }
          ]}
          onPress={() => navigation.navigate(SCREENS.PAYMENT_CARD)}
        >
          <Text style={s.primaryBtnText}>Başka kartla dene</Text>
        </Pressable>
        <Pressable 
          style={({ pressed }) => [
            s.secondaryBtn,
            pressed && { opacity: 0.7 }
          ]}
          onPress={() => navigation.navigate(ROOT_STACK.MAIN_TABS)}
        >
          <Text style={s.secondaryBtnText}>Ücretsiz sürümle devam et</Text>
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
    centerBlock: {
      alignItems: "center",
      paddingHorizontal: 40,
      paddingTop: 56,
    },
    title: {
      fontFamily: "BricolageGrotesque_400Regular",
      fontSize: 22,
      lineHeight: 28.6, // 1.3
      color: C.text,
      marginTop: 26,
    },
    subtitle: {
      fontFamily: "Archivo_400Regular",
      fontSize: 13.5,
      lineHeight: 21.6, // 1.6
      color: C.text3,
      marginTop: 12,
      textAlign: "center",
      maxWidth: 258,
    },
    detailsBlock: {
      paddingHorizontal: GUTTER,
      paddingTop: 26,
    },
    responseCard: {
      paddingHorizontal: 18,
      paddingVertical: 16,
      borderRadius: SHAPE.card,
      backgroundColor: C.void,
      borderWidth: 1,
      borderColor: C.elev,
    },
    responseLabel: {
      fontFamily: "Archivo_600SemiBold",
      fontSize: 11.5,
      letterSpacing: 1.84, // .16em
      color: C.text3,
    },
    responseText: {
      fontFamily: "Archivo_500Medium",
      fontSize: 13,
      lineHeight: 20.8, // 1.6
      color: C.text2,
      marginTop: 9,
    },
    tipsList: {
      marginTop: 18,
    },
    tipRow: {
      flexDirection: "row",
      gap: 13,
      paddingVertical: 13,
      borderTopWidth: 1,
      borderTopColor: C.line,
    },
    tipDot: {
      width: 5,
      height: 5,
      borderRadius: 1,
      backgroundColor: C.text4,
      marginTop: 7,
      flexShrink: 0,
    },
    tipText: {
      flex: 1,
      fontFamily: "Archivo_400Regular",
      fontSize: 13,
      lineHeight: 19.5, // 1.5
      color: C.text2,
    },
    footerContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: GUTTER,
      paddingTop: 14,
      paddingBottom: 26,
      backgroundColor: C.bg, // Mock linear gradient
      borderTopWidth: 1,
      borderTopColor: C.line,
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
    },
    secondaryBtn: {
      width: "100%",
      height: 46,
      marginTop: 12,
      borderRadius: SHAPE.button,
      borderWidth: 1,
      borderColor: C.border,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryBtnText: {
      fontFamily: "Archivo_600SemiBold",
      fontSize: 13.5,
      color: C.text2,
    }
  });
}
